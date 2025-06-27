import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google/google.strategy';
import { Repository } from 'typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: config.get<string>('EXPIRE_JWT_AUTH') },
      }),
    }),

    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: GoogleStrategy,
      useFactory: (
        configService: ConfigService,
        jwtService: JwtService,
        userRepo: Repository<User>,
      ) => {
        return new GoogleStrategy(userRepo, jwtService, configService);
      },
      inject: [ConfigService, JwtService, getRepositoryToken(User)],
    },
  ],
})
export class AuthModule {}
