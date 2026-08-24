import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AcademiesController } from './academies.controller';
import { AcademiesService } from './academies.service';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Academy.name, schema: AcademySchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [AcademiesController],
  providers: [AcademiesService, TenantContextService],
  exports: [AcademiesService],
})
export class AcademiesModule {}
