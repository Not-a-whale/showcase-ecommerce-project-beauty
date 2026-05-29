import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Run passport JWT validation (signature + expiry)
    const isValid = await (super.canActivate(context) as Promise<boolean>);
    if (!isValid) return false;

    // ========================================================
    // TODO: Implement blacklist + tokenVersion check
    // 
    // 1. Extract token from Authorization header
    // 2. Check Redis blacklist: `bl:${token}` — if exists, throw UnauthorizedException
    // 3. Check tokenVersion: `tv:${userId}` in Redis
    //    - if exists and !== payload.tokenVersion, throw UnauthorizedException
    // 
    // This is YOUR business logic to implement.
    // ========================================================

    return true;
  }
}
