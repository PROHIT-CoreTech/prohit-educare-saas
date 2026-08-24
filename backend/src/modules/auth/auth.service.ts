import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Academy, AcademyDocument } from '../../database/schemas/academy.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Academy.name) private academyModel: Model<AcademyDocument>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string, academySlug?: string) {
    const cleanEmail = email.toLowerCase().trim();
    let academy: AcademyDocument | null = null;

    if (academySlug) {
      academy = await this.academyModel.findOne({ slug: academySlug.toLowerCase().trim() }).exec();
      if (!academy) {
        throw new NotFoundException(`Academy with slug '${academySlug}' not found`);
      }
    }

    const query: any = { email: cleanEmail };
    if (academy) {
      query.academyId = academy._id;
    }

    const users = await this.userModel.find(query).exec();
    if (!users || users.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Pick matching user
    let user: UserDocument | null = null;
    for (const u of users) {
      const isMatch = await bcrypt.compare(pass, u.passwordHash);
      if (isMatch) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    if (!academy) {
      academy = await this.academyModel.findById(user.academyId).exec();
    }

    const payload = {
      sub: user._id.toString(),
      academyId: user.academyId.toString(),
      role: user.role,
      email: user.email,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
      expiresIn: '7d',
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      academy: academy
        ? {
            id: academy._id,
            name: academy.name,
            slug: academy.slug,
            primaryColor: academy.primaryColor,
            subscriptionStatus: academy.subscriptionStatus,
          }
        : null,
    };
  }
}
