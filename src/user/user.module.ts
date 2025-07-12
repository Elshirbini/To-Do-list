import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AwsModule } from 'src/aws/aws.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]), AwsModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
