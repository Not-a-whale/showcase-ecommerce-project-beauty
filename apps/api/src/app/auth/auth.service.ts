import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ChangePasswordDto, LoginDto, SignupDto } from './dto/auth.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '@ecommerce/shared-types';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import ms, { type StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from './dto/auth-response.dto';
import { plainToInstance } from 'class-transformer';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async login(
    loginDto: LoginDto,
    response: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.userRepo.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new ForbiddenException('Account is banned');
    }

    const { accessToken, refreshToken } = await this.generateTokenPair(user);
    this.setRefreshCookie(response, refreshToken);

    return plainToInstance(AuthResponseDto, {
      accessToken,
      user,
    });
  }

  async refresh(payload: JwtPayload, response: Response) {
    const user = await this.userRepo.findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isBanned) {
      throw new ForbiddenException('Account is banned');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const { accessToken, refreshToken } = await this.generateTokenPair(user);
    this.setRefreshCookie(response, refreshToken);

    return plainToInstance(AuthResponseDto, {
      accessToken,
      user,
    });
  }

  async signup(
    signupDto: SignupDto,
    response: Response,
  ): Promise<AuthResponseDto> {
    const existingUser = await this.userRepo.findOne({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const createdUser = this.userRepo.create({
      email: signupDto.email,
      passwordHash: hashedPassword,
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
    });

    let savedUser: User;

    try {
      savedUser = await this.userRepo.save(createdUser);
    } catch (err: any) {
      if (err.code === '23505') {
        throw new ConflictException('Email already in use');
      }
      throw err;
    }

    const { accessToken, refreshToken } =
      await this.generateTokenPair(savedUser);

    this.setRefreshCookie(response, refreshToken);

    return plainToInstance(AuthResponseDto, {
      accessToken,
      user: savedUser,
    });
  }

  private setRefreshCookie(response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: ms(
        this.getJwtExpiresIn(
          this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
          '7d',
        ),
      ),
    });
  }

  private getJwtExpiresIn(
    value: string | undefined,
    fallback: StringValue,
  ): StringValue {
    return (value as StringValue | undefined) ?? fallback;
  }

  private async generateTokenPair(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.getJwtExpiresIn(
        this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
        '15m',
      ),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.getJwtExpiresIn(
        this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
        '7d',
      ),
    });

    return { accessToken, refreshToken };
  }

  async logout(token: string, response: Response) {
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    /// count token ttl
    const decoded = this.jwtService.decode(token);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - nowSeconds;

    if (ttl > 0) {
      await this.redisService.set(`bl:${token}`, '1', ttl);
    }

    // clear the cookie
    response.clearCookie('refreshToken');
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    response: Response,
  ): Promise<any> {
    // TODO:
    // 1. найти юзера по userId (findOne)
    //    - если нет → UnauthorizedException
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // 2. bcrypt.compare(dto.currentPassword, user.passwordHash)
    //    - если не совпал → UnauthorizedException('Current password is incorrect')
    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    // 3. hash нового пароля
    const newHash = await bcrypt.hash(dto.newPassword, 10);
    // 4. инкремент tokenVersion:
    //    user.passwordHash = newHash
    //    user.tokenVersion += 1
    //    await this.userRepo.save(user)
    user.passwordHash = newHash;
    user.tokenVersion += 1;
    await this.userRepo.save(user);
    // 5. закэшировать в Redis:
    //    redisService.set(`tv:${userId}`, String(user.tokenVersion), 900)
    await this.redisService.set(`tv:${userId}`, String(user.tokenVersion), 900);
    // 6. (опционально) выдать новую пару токенов с новым tokenVersion
    //    + setRefreshCookie
    response.clearCookie('refreshToken');
    // 7. вернуть новую пару ИЛИ просто { success: true }
    return { success: true };
  }
}
