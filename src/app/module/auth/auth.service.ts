import { HttpException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/entities/user.entity';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import config from 'src/app/config';
import sendMailer from 'src/app/helper/sendMailer';
import {
  Loginhistory,
  LoginhistoryDocument,
} from '../loginhistory/entities/loginhistory.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: mongoose.Model<User>,
    @InjectModel(Loginhistory.name)
    private readonly loginhistoryModel: mongoose.Model<LoginhistoryDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createAuthDto: CreateAuthDto) {
    const user = await this.userModel.findOne({ email: createAuthDto.email });
    if (user) throw new HttpException('Email already exists', 400);

    const firstName = createAuthDto.fullName?.split(' ')[0].trim() || '';
    const lastName =
      createAuthDto.fullName?.split(' ').slice(1).join(' ').trim() || '';

    if (createAuthDto.role === 'user') {
      createAuthDto.status = 'active';
    }

    const result = await this.userModel.create({
      ...createAuthDto,
      firstName,
      lastName,
    });
    if (!result) throw new HttpException('Register failed', 400);
    return result;
  }

  async login(
    payload: { email: string; password: string },
    res: Response,
    req: Request,
  ) {
    const forwarded = req.headers['x-forwarded-for'];

    let ipaddress =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0]
        : req.socket.remoteAddress || 'unknown';

    if (ipaddress === '::1') {
      ipaddress = '127.0.0.1';
    }

    const user = await this.userModel
      .findOne({ email: payload.email })
      .select('+password');

    if (!user) {
      await this.loginhistoryModel.create({
        email: payload.email,
        role: 'User Login',
        ipaddress,
        loginTime: new Date(),
        status: 'failed',
      });

      throw new HttpException('Email not found', 404);
    }

    const isMatch = await bcrypt.compare(payload.password, user.password);

    if (!isMatch) {
      await this.loginhistoryModel.create({
        userId: user._id,
        email: user.email,
        role: 'User Login',
        ipaddress,
        loginTime: new Date(),
        status: 'failed',
      });

      throw new HttpException('Password incorrect', 400);
    }

    if (user.status === 'block') {
      await this.loginhistoryModel.create({
        userId: user._id,
        email: user.email,
        role: 'User Login',
        ipaddress,
        loginTime: new Date(),
        status: 'blocked',
      });

      throw new HttpException('Your account has been blocked', 400);
    }

    const accessToken = this.jwtService.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      {
        secret: config.jwt.accessTokenSecret,
        expiresIn: config.jwt.accessTokenExpires,
      } as JwtSignOptions,
    );

    const refreshToken = this.jwtService.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      {
        secret: config.jwt.refreshTokenSecret,
        expiresIn: config.jwt.refreshTokenExpires,
      } as JwtSignOptions,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
    });

    await this.loginhistoryModel.create({
      userId: user._id,
      email: user.email,
      role: 'User Login',
      ipaddress,
      loginTime: new Date(),
      status: 'success',
    });

    return {
      accessToken,
      user,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new HttpException('Email not found', 404);

    // generate 6 digit OTP
    const generateOtpNumber = Math.floor(100000 + Math.random() * 900000);

    // set OTP and expiry (1 hour)
    user.otp = generateOtpNumber.toString();
    user.otpExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // modern email template
    const html = `
    <div style="font-family: Arial; text-align: center;">
      <h2 style="color:#4f46e5;">Password Reset OTP</h2>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing:4px;">${generateOtpNumber}</h1>
      <p>This code will expire in 1 hour.</p>
    </div>
  `;

    await sendMailer(user.email, 'Reset Password OTP', html);

    return { message: 'Check your email for OTP' };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new HttpException('Invalid link', 400);

    if (user.otp !== otp) throw new HttpException('Invalid OTP', 400);
    if (!user.otpExpiry) throw new HttpException('Invalid OTP', 400);
    const todayDate = new Date();
    if (user.otpExpiry < todayDate) throw new HttpException('OTP expired', 400);

    user.otp = undefined as any;
    user.otpExpiry = undefined as any;

    user.verifiedForget = true;
    await user.save();
    if (!user.verifiedForget) throw new HttpException('Invalid link', 400);

    return { message: 'OTP verified successfully' };
  }

  async resetPasswordChange(email: string, newPassword: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new HttpException('Invalid link', 400);

    if (!user.verifiedForget) throw new HttpException('Invalid link', 400);

    user.password = newPassword;
    user.verifiedForget = false;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new HttpException('User not found', 404);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) throw new HttpException('Invalid old password', 400);

    if (oldPassword === newPassword)
      throw new HttpException(
        'New password cannot be same as old password',
        400,
      );

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }
}
