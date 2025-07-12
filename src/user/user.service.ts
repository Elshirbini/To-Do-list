import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { FastifyRequest } from 'fastify';
import { MemoryStorageFile } from '@blazity/nest-file-fastify';
import { validateUploadedFile } from 'src/utils/file-validation.util';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private awsService: AwsService,
  ) {}
  async getAllUser() {
    const users = await this.userRepo.find({ order: { createdAt: 'DESC' } });
    return { users };
  }

  async getUser(id: string) {
    const user = await this.userRepo.findOneBy({ user_id: id });
    if (!user) throw new NotFoundException('User not found');
    return { user };
  }

  async getProfile(req: FastifyRequest) {
    const userId = req.userId;
    const user = await this.userRepo.findOneBy({ user_id: userId });
    if (!user) throw new NotFoundException('User not found');
    return { user };
  }

  async updateUser(
    id: string,
    file: MemoryStorageFile,
    userData: UpdateUserDto,
  ) {
    const user = await this.userRepo.findOneBy({
      user_id: id,
    });
    if (!user) throw new NotFoundException('User not found');

    if (file) {
      await validateUploadedFile(file.buffer, {
        maxSizeInMB: 2,
        allowedMimeTypes: [
          'image/jpg',
          'image/jpeg',
          'image/png',
          'image/webp',
        ],
      });

      const result = await this.awsService.uploadFileS3(
        file.buffer,
        '/profileImages',
        file.mimetype,
      );

      userData.imageUrl = result.url;
      userData.imageKey = result.key;
    }

    Object.assign(user, userData);

    const updatedUser = await this.userRepo.save(user);

    return {
      message: 'User updated successfully',
      updatedUser,
    };
  }

  async deleteUser(id: string) {
    const user = await this.userRepo.findOneBy({ user_id: id });
    if (!user) throw new NotFoundException('User not found');

    if (user.imageKey) {
      await this.awsService.deleteFileS3(user.imageKey);
    }

    await this.userRepo.remove(user);
    return { message: 'User deleted successfully' };
  }
}
