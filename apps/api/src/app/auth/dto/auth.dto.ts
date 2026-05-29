import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import {
  ChangePasswordRequest,
  LoginRequest,
  SignupRequest,
} from '@ecommerce/shared-types';

export class LoginDto implements LoginRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class SignupDto implements SignupRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;
}

export class ChangePasswordDto implements ChangePasswordRequest {
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword: string;
}


