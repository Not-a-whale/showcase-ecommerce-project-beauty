import { ConflictException, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/auth.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '@ecommerce/shared-types';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import ms, { type StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto, response: Response) {
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
    const savedUser = await this.userRepo.save(createdUser);

    const { accessToken, refreshToken } =
      await this.generateTokenPair(savedUser);
    this.setRefreshCookie(response, refreshToken);

    return {
      accessToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
      },
    };
  }

  private setRefreshCookie(response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ms(
        this.getJwtExpiresIn(process.env.JWT_REFRESH_EXPIRATION, '7d'),
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
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: this.getJwtExpiresIn(process.env.JWT_ACCESS_EXPIRATION, '15m'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: this.getJwtExpiresIn(process.env.JWT_REFRESH_EXPIRATION, '7d'),
    });

    return { accessToken, refreshToken };
  }
}
