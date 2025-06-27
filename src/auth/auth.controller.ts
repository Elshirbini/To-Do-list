import {
  Controller,
  Post,
  Body,
  Res,
  Patch,
  Param,
  HttpCode,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { OtpDto } from './dto/otp.dto';
import { EmailDto } from './dto/email.dto';
import { PasswordDto } from './dto/password.dto';
import { CodeDto } from './dto/code.dto';
import { GoogleUser } from './interfaces/google-user.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google login
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(
    @Req() req: FastifyRequest & { user: GoogleUser },
    @Res() res: FastifyReply,
  ) {
    return this.authService.googleAuthRedirect(req, res);
  }

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
