import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantContextService } from '../services/tenant-context.service';

@Injectable()
export class AcademyAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'super-secret-key-123' });
      if (!payload || !payload.academyId) {
        throw new UnauthorizedException('Invalid Academy JWT payload: missing academyId');
      }
      if (payload.type === 'PLATFORM') {
        throw new UnauthorizedException('Platform JWT tokens cannot access Academy endpoints');
      }

      request.user = payload;

      this.tenantContextService.setContext({
        userId: payload.sub,
        academyId: payload.academyId,
        role: payload.role,
        email: payload.email,
        isImpersonating: payload.isImpersonating || false,
      });

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
