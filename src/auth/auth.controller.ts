import {
  Controller,
  Post,
  Body,
  Res,
  Patch,
  Param,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { FastifyReply } from 'fastify';
import { OtpDto } from './dto/otp.dto';
import { EmailDto } from './dto/email.dto';
import { PasswordDto } from './dto/password.dto';
import { CodeDto } from './dto/code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() userData: LoginDto,
  ) {
    return this.authService.login(userData, res);
  }

  @Post('/signup')
  signup(@Body() userData: SignupDto) {
    return this.authService.signup(userData);
  }

  @Post('/verify-email')
  @HttpCode(201)
  verifyEmail(@Body() otpDto: OtpDto) {
    return this.authService.verifyEmail(otpDto);
  }

  @Post('/forget-password')
  forgetPassword(@Body() emailDto: EmailDto) {
    return this.authService.forgetPassword(emailDto);
  }

  @Post('/verify-code/:id')
  verifyCode(@Param('id') id: string, @Body() codeDto: CodeDto) {
    return this.authService.verifyCode(id, codeDto);
  }

  @Patch('/new-password/:id')
  newPassword(
    @Param('id') id: string,
    @Body() passwordDto: PasswordDto,
    @Res() res: FastifyReply,
  ) {
    return this.authService.newPassword(id, passwordDto, res);
  }
}
