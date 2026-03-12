import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import type { Request, Response } from 'express';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() createAuthDto: CreateAuthDto) {
    const result = await this.authService.register(createAuthDto);
    return {
      message: 'User registered successfully',
      data: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'user@email.com' },
        password: { type: 'string', example: 'Password@123' },
      },
    },
  })
  async login(
    @Body() createAuthDto: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const result = await this.authService.login(createAuthDto, res, req);
    return {
      message: 'User logged in successfully',
      data: result,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to email for password reset' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', example: 'user@email.com' },
      },
    },
  })
  async forgotPassword(@Body() createAuthDto: { email: string }) {
    const result = await this.authService.forgotPassword(createAuthDto.email);
    return {
      message: 'Email sent successfully',
      data: result,
    };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with OTP' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'otp'],
      properties: {
        email: { type: 'string', example: 'user@email.com' },
        otp: { type: 'string', example: '123456' },
      },
    },
  })
  async verifyEmail(@Body() createAuthDto: { email: string; otp: string }) {
    const result = await this.authService.verifyEmail(
      createAuthDto.email,
      createAuthDto.otp,
    );
    return {
      message: 'Email verified successfully',
      data: result,
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password after OTP verify' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'newPassword'],
      properties: {
        email: { type: 'string', example: 'user@email.com' },
        newPassword: { type: 'string', example: 'NewPassword@123' },
      },
    },
  })
  async resetPasswordChange(
    @Body() CreateAuthDto: { email: string; newPassword: string },
  ) {
    const result = await this.authService.resetPasswordChange(
      CreateAuthDto.email,
      CreateAuthDto.newPassword,
    );
    return {
      message: 'Password changed successfully',
      data: result,
    };
  }

  @Post('change-password')
  @UseGuards(AuthGuard('user', 'agent', 'seller', 'vendor', 'admin'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change password (logged in user)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['oldPassword', 'newPassword'],
      properties: {
        oldPassword: { type: 'string', example: 'OldPassword@123' },
        newPassword: { type: 'string', example: 'NewPassword@123' },
      },
    },
  })
  async changePassword(
    @Body() CreateAuthDto: { oldPassword: string; newPassword: string },
    @Req() req: Request,
  ) {
    console.log(req.user!.id);
    const result = await this.authService.changePassword(
      req.user!.id,
      CreateAuthDto.oldPassword,
      CreateAuthDto.newPassword,
    );
    return {
      message: 'Password changed successfully',
      data: result,
    };
  }
}