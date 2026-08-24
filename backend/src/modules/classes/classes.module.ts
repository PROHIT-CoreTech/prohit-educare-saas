import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { ClassBatch, ClassBatchSchema } from '../../database/schemas/class-batch.schema';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassBatch.name, schema: ClassBatchSchema },
      { name: Academy.name, schema: AcademySchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [ClassesController],
  providers: [ClassesService, TenantContextService],
  exports: [ClassesService],
})
export class ClassesModule {}
