import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { JwtPayload } from '@ecommerce/shared-types';
import { RedisService } from '../../redis/redis.service';
import { IS_PUBLIC_KEY } from '../decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isValid = await (super.canActivate(context) as Promise<boolean>);
    if (!isValid) return false;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    const user = request.user as JwtPayload;

    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    const isBlacklisted = await this.redisService.get(`bl:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token revoked');
    }

    const cachedTokenVersion = await this.redisService.get(`tv:${user.userId}`);
    if (
      cachedTokenVersion !== null &&
      cachedTokenVersion !== String(user.tokenVersion)
    ) {
      throw new UnauthorizedException('Token revoked');
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.substring(7);
  }
}
