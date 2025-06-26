import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Raw, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply } from 'fastify';
import { sendEmail } from 'src/utils/send-mail.util';
import { generateOTP } from 'src/utils/generate-otp.util';
import { RedisService } from 'src/redis/redis.service';
import { OtpDto } from './dto/otp.dto';
import { EmailDto } from './dto/email.dto';
import { PasswordDto } from './dto/password.dto';
import { randomBytes, createHash } from 'crypto';
import { CodeDto } from './dto/code.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async login(userData: LoginDto, res: FastifyReply) {
    const user = await this.userRepo.findOneBy({ email: userData.email });
    if (!user) throw new NotFoundException('User not found');

    const isPassEqual = await bcrypt.compare(userData.password, user.password);
    if (!isPassEqual) throw new UnauthorizedException('Wrong password');

    const accessToken = await this.jwtService.signAsync({
      id: user?.user_id,
      role: user?.role,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'lax',
      path: '/',
      maxAge: 3 * 24 * 60 * 60,
    });

    return {
      status: 'success',
      message: 'Log in successfully',
      data: null,
    };
  }

  async signup(userData: SignupDto) {
    const userExist = await this.userRepo.findOneBy({ email: userData.email });
    if (userExist) {
      throw new ForbiddenException('This email is already used');
    }

    const otp = generateOTP();

    await sendEmail(
      userData.email,
      'Email Verification',
      `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333;">👋 Welcome to My App</h2>
      <p style="font-size: 16px;">Use the following OTP to complete your verification process:</p>
      <div style="font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0;">${otp}</div>
      <p style="font-size: 14px; color: #666;">This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #aaa;">If you did not request this code, please ignore this email.</p>
    </div>
  `,
    );

    const hashedPass = await bcrypt.hash(userData.password, 12);

    userData.password = hashedPass;

    await this.redisService.set(otp, JSON.stringify(userData), 300);

    return {
      status: 'success',
      message: 'OTP sent successfully',
      data: null,
    };
  }

  async verifyEmail(otpDto: OtpDto) {
    const userData = await this.redisService.get(otpDto.otp);
    if (!userData) {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    const parsedData = JSON.parse(userData) as SignupDto;

    await this.userRepo.save(parsedData);

    await this.redisService.del(otpDto.otp);

    await sendEmail(
      parsedData.email,
      '✅ Account Created Successfully',
      `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #28a745;">🎉 Account Created Successfully!</h2>
    <p style="font-size: 16px; color: #333;">Hi there,</p>
    <p style="font-size: 16px; color: #333;">
      Your account has been created successfully. You can now log in and start using our services.
    </p>
    <p style="font-size: 14px; color: #666;">If you have any questions or need help, feel free to reach out to our support team.</p>
    <hr style="margin: 30px 0;">
    <p style="font-size: 12px; color: #aaa;">Thank you for joining us!</p>
  </div>
  `,
    );

    return {
      status: 'success',
      message: 'Account Created Successfully',
      data: null,
    };
  }

  async forgetPassword(emailDto: EmailDto) {
    const user = await this.userRepo.findOneBy({ email: emailDto.email });
    if (!user) throw new NotFoundException('This email has no account');

    const code = randomBytes(3).toString('hex');

    const hashedCode = createHash('sha256').update(code).digest('hex');

    Object.assign(user, {
      codeValidation: hashedCode,
      codeValidationExpire: new Date(Date.now() + 5 * 60 * 1000),
    });

    await this.userRepo.save(user);

    await sendEmail(
      emailDto.email,
      'Forget Password',
      `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333;">👋 Welcome to My App</h2>
      <p style="font-size: 16px;">Use the following code to change your password:</p>
      <div style="font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0;">${code}</div>
      <p style="font-size: 14px; color: #666;">This code is valid for 5 minutes. Please do not share it with anyone.</p>
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #aaa;">If you did not request this code, please ignore this email.</p>
    </div>
  `,
    );

    return {
      status: 'success',
      message: 'Code sent successfully',
      data: null,
    };
  }

  async verifyCode(id: string, codeDto: CodeDto) {
    const code = codeDto.code;
    const hashedCode = createHash('sha256').update(code).digest('hex');

    const user = await this.userRepo.findOneBy({
      user_id: id,
      codeValidation: hashedCode,
      codeValidationExpire: Raw((alias) => `${alias} > NOW()`),
    });

    if (!user) throw new UnauthorizedException('Code is invalid or expired');

    return {
      status: 'success',
      message: 'Your Code verified successfully',
      data: { userId: id },
    };
  }

  async newPassword(id: string, passwordDto: PasswordDto, res: FastifyReply) {
    const user = await this.userRepo.findOneBy({ user_id: id });
    if (!user) throw new NotFoundException('User not found');

    const hashedPass = await bcrypt.hash(passwordDto.password, 12);

    Object.assign(user, {
      password: hashedPass,
      codeValidation: null,
      codeValidationExpire: null,
    });

    await this.userRepo.save(user);

    res.clearCookie('accessToken');

    return {
      status: 'success',
      message: 'Your password change successfully',
      data: null,
    };
  }
}
