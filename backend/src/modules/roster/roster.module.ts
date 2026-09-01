import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { RosterController } from './roster.controller';
import { RosterService } from './roster.service';
import { Roster, RosterSchema } from '../../database/schemas/roster.schema';
import { Faculty, FacultySchema } from '../../database/schemas/faculty.schema';
import { Academy, AcademySchema } from '../../database/schemas/academy.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Roster.name, schema: RosterSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: Academy.name, schema: AcademySchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
    }),
  ],
  controllers: [RosterController],
  providers: [RosterService, TenantContextService],
  exports: [RosterService],
})
export class RosterModule {}
