/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { FastifyRequest } from 'fastify';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { jwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = request.cookies?.accessToken;
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const payload: jwtPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const user = await this.userRepo.findOneBy({ user_id: payload.id });
      if (!user) throw new NotFoundException('User not found');

      request.userId = payload.id;
      request.userRole = payload.role;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token has expired');
    }
  }
}
