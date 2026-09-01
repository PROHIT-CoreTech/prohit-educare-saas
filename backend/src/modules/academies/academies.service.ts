import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Academy, AcademyDocument } from '../../database/schemas/academy.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { SignupAcademyDto } from './dto/signup.dto';
import { TenantContextService } from '../../common/services/tenant-context.service';

const RESERVED_SLUGS = ['admin', 'api', 'app', 'www', 'platform', 'public', 'auth', 'billing', 'dash', 'help', 'root', 'static'];

@Injectable()
export class AcademiesService {
  constructor(
    @InjectModel(Academy.name) private academyModel: Model<AcademyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private tenantContextService: TenantContextService,
  ) {}

  async checkSlugAvailability(slug: string): Promise<{ available: boolean; reason?: string }> {
    const cleanSlug = slug.toLowerCase().trim();
    if (RESERVED_SLUGS.includes(cleanSlug)) {
      return { available: false, reason: `'${cleanSlug}' is a reserved subdomain` };
    }
    const existing = await this.academyModel.findOne({ slug: cleanSlug }).lean().exec();
    if (existing) {
      return { available: false, reason: `'${cleanSlug}' is already taken` };
    }
    return { available: true };
  }

  async signup(dto: SignupAcademyDto) {
    const slug = dto.slug.toLowerCase().trim();
    const availability = await this.checkSlugAvailability(slug);
    if (!availability.available) {
      throw new ConflictException(availability.reason);
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const academy = await this.academyModel.create({
      name: dto.name,
      slug,
      logoUrl: dto.logoUrl ? dto.logoUrl.trim() : '',
      primaryColor: dto.primaryColor || '#f97316',
      subscriptionStatus: 'TRIAL',
      trialEndsAt,
    });

    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);
    const user = await this.userModel.create({
      academyId: academy._id,
      name: dto.adminName,
      email: dto.adminEmail.toLowerCase().trim(),
      passwordHash,
      role: 'SUPER_ADMIN',
      phone: dto.phone || '',
      isActive: true,
    });

    const payload = {
      sub: user._id.toString(),
      academyId: academy._id.toString(),
      role: user.role,
      email: user.email,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
      expiresIn: '7d',
    });

    return {
      message: 'Academy created successfully with 14-day trial',
      token,
      academy: {
        id: academy._id,
        name: academy.name,
        slug: academy.slug,
        logoUrl: academy.logoUrl,
        primaryColor: academy.primaryColor,
        subscriptionStatus: academy.subscriptionStatus,
        trialEndsAt: academy.trialEndsAt,
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getMyAcademy() {
    const academyId = this.tenantContextService.academyId;
    const academy = await this.academyModel.findById(academyId).exec();
    if (!academy) {
      throw new NotFoundException('Academy not found');
    }
    return academy;
  }

  async updateMyAcademy(dto: {
    name?: string;
    directorName?: string;
    phone?: string;
    email?: string;
    address?: string;
    logoUrl?: string;
    primaryColor?: string;
  }) {
    const academyId = this.tenantContextService.academyId;
    const updated = await this.academyModel
      .findByIdAndUpdate(academyId, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Academy not found');
    }
    return updated;
  }
}
