import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';
import { SubscriptionActiveGuard } from '../../common/guards/subscription-active.guard';

@UseGuards(AcademyAuthGuard, SubscriptionActiveGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  create(@Body() body: any) {
    return this.classesService.create(body);
  }

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }
}
