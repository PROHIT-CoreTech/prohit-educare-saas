import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RosterController } from './roster.controller';
import { RosterService } from './roster.service';
import { Roster, RosterSchema } from '../../database/schemas/roster.schema';
import { Faculty, FacultySchema } from '../../database/schemas/faculty.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Roster.name, schema: RosterSchema },
      { name: Faculty.name, schema: FacultySchema },
    ]),
  ],
  controllers: [RosterController],
  providers: [RosterService],
  exports: [RosterService],
})
export class RosterModule {}
