import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AcademiesService } from './academies.service';
import { SignupAcademyDto } from './dto/signup.dto';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';

@Controller('academies')
export class AcademiesController {
  constructor(private readonly academiesService: AcademiesService) {}

  @Post('signup')
  async signup(@Body() dto: SignupAcademyDto) {
    return this.academiesService.signup(dto);
  }

  @Get('check-slug/:slug')
  async checkSlug(@Param('slug') slug: string) {
    return this.academiesService.checkSlugAvailability(slug);
  }

  @UseGuards(AcademyAuthGuard)
  @Get('my-academy')
  async getMyAcademy() {
    return this.academiesService.getMyAcademy();
  }
}
