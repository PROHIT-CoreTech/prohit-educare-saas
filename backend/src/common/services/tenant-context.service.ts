import { Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';

export interface TenantUserPayload {
  userId: string;
  academyId: string;
  role: string;
  email: string;
  isImpersonating?: boolean;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private _academyId?: Types.ObjectId;
  private _userId?: Types.ObjectId;
  private _role?: string;
  private _email?: string;
  private _isImpersonating: boolean = false;

  setContext(payload: TenantUserPayload): void {
    if (!payload.academyId) {
      throw new UnauthorizedException('Missing tenant context (academyId)');
    }
    this._academyId = new Types.ObjectId(payload.academyId);
    this._userId = payload.userId ? new Types.ObjectId(payload.userId) : undefined;
    this._role = payload.role;
    this._email = payload.email;
    this._isImpersonating = payload.isImpersonating || false;
  }

  get academyId(): Types.ObjectId {
    if (!this._academyId) {
      throw new UnauthorizedException('Tenant context not set in Request scope');
    }
    return this._academyId;
  }

  get userId(): Types.ObjectId | undefined {
    return this._userId;
  }

  get role(): string | undefined {
    return this._role;
  }

  get email(): string | undefined {
    return this._email;
  }

  get isImpersonating(): boolean {
    return this._isImpersonating;
  }

  hasContext(): boolean {
    return !!this._academyId;
  }
}
