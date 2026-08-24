import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student, StudentSchema } from '../../database/schemas/student.schema';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Academy.name, schema: AcademySchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [StudentsController],
  providers: [StudentsService, TenantContextService],
  exports: [StudentsService],
})
export class StudentsModule {}
