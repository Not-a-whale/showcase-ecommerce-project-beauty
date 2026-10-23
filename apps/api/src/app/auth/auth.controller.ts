import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto, SignupDto } from './dto/auth.dto';
import type { JwtPayload } from '@ecommerce/shared-types';
import { CurrentUser, Public } from '../common/decorators';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signup(signupDto, response);
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginDto, response);
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = req.headers.authorization?.substring(7);

    if (!token) {
      throw new UnauthorizedException();
    }

    return this.authService.logout(token, response);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @CurrentUser() payload: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refresh(payload, response);
  }

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.userId);
  }

  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.changePassword(
      user.userId,
      changePasswordDto,
      response,
    );
  }
}
