import { Controller, Post, Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { PlatformAuthGuard } from '../../common/guards/platform-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Post('auth/login')
  async login(@Body() body: { email: string; pass: string }) {
    return this.platformService.login(body.email, body.pass);
  }

  @UseGuards(PlatformAuthGuard)
  @Get('metrics')
  async getMetrics() {
    return this.platformService.getMetrics();
  }

  @UseGuards(PlatformAuthGuard)
  @Get('academies')
  async getAllAcademies() {
    return this.platformService.getAllAcademies();
  }

  @UseGuards(PlatformAuthGuard)
  @Get('audit-logs')
  async getPlatformAuditLogs() {
    return this.platformService.getPlatformAuditLogs();
  }

  @UseGuards(PlatformAuthGuard)
  @Post('academies/register-offline')
  async registerOfflineAcademy(
    @Body()
    body: {
      name: string;
      slug: string;
      adminName: string;
      adminEmail: string;
      adminPassword?: string;
      phone?: string;
      institutionType?: string;
      educationBoard?: string;
      plan?: string;
      subscriptionStatus?: string;
      paymentMode?: string;
      paymentReference?: string;
    },
    @GetUser('sub') platformUserId: string,
  ) {
    return this.platformService.registerOfflineAcademy(body, platformUserId);
  }

  @UseGuards(PlatformAuthGuard)
  @Get('academies/:id/records')
  async getTenantFullRecords(@Param('id') id: string) {
    return this.platformService.getTenantFullRecords(id);
  }

  @UseGuards(PlatformAuthGuard)
  @Patch('academies/:id/status')
  async updateAcademyStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.platformService.updateAcademyStatus(id, status);
  }

  @UseGuards(PlatformAuthGuard)
  @Patch('academies/:id/category')
  async updateAcademyCategory(
    @Param('id') id: string,
    @Body() body: { institutionType?: string; educationBoard?: string },
  ) {
    return this.platformService.updateAcademyCategory(id, body);
  }

  @UseGuards(PlatformAuthGuard)
  @Post('academies/:id/impersonate')
  async impersonateAcademy(@Param('id') id: string, @GetUser('sub') platformUserId: string) {
    return this.platformService.impersonateAcademy(platformUserId, id);
  }
}
