import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; pass: string; password?: string; academySlug?: string }) {
    const password = body.pass || body.password;
    return this.authService.login(body.email, password, body.academySlug);
  }

  @UseGuards(AcademyAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return { user: req.user };
  }

  @UseGuards(AcademyAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() body: { currentPassword?: string; currentPass?: string; newPassword?: string; newPass?: string }) {
    const currentPass = body.currentPassword || body.currentPass || '';
    const newPass = body.newPassword || body.newPass || '';
    const userId = req.user.sub;
    return this.authService.changePassword(userId, currentPass, newPass);
  }
}
