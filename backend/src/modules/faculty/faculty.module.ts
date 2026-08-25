import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Faculty, FacultySchema } from '../../database/schemas/faculty.schema';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Faculty.name, schema: FacultySchema },
      { name: Academy.name, schema: AcademySchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [FacultyController],
  providers: [FacultyService, TenantContextService],
  exports: [FacultyService],
})
export class FacultyModule {}
