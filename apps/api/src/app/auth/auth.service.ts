import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, SignupDto } from './dto/auth.dto';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
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
}
