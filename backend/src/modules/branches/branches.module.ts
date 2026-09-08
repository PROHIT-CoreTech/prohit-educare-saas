import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { Branch, BranchSchema } from '../../database/schemas/branch.schema';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { Student, StudentSchema } from '../../database/schemas/student.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Branch.name, schema: BranchSchema },
      { name: Academy.name, schema: AcademySchema },
      { name: Student.name, schema: StudentSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [BranchesController],
  providers: [BranchesService, TenantContextService],
  exports: [BranchesService],
})
export class BranchesModule {}
