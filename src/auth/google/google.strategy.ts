import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
      authorizationURL:
        'https://accounts.google.com/o/oauth2/v2/auth?prompt=select_account',
    });
  }

  async validate(
    req: FastifyRequest & { res: FastifyReply },
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ): Promise<any> {
    const frontEndUrl =
      process.env.NODE_ENV === 'dev'
        ? process.env.FRONTEND_URL
        : process.env.FRONTEND_URL_PROD;
    const res = req.res;

    const email = profile.emails?.[0]?.value;
    if (!email) {
      return res.redirect(
        `${frontEndUrl}/auth-error?message=Email%20is%20required`,
      );
    }

    const user = await this.userRepo.findOneBy({ email });

    if (!user) {
      return res.redirect(
        `${frontEndUrl}/auth-error?message=Account%20not%20found`,
      );
    }

    const token = await this.jwtService.signAsync({
      id: user.user_id,
      role: user.role,
    });

    return done(null, {
      token,
      role: user.role,
    });
  }
}
