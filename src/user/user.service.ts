import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { FastifyRequest } from 'fastify';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
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

  async updateUser(id: string, userData: UpdateUserDto) {
    const user = await this.userRepo.findOneBy({
      user_id: id,
    });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, userData);

    const updatedUser = await this.userRepo.save(user);

    return {
      message: 'User updated successfully',
      updatedUser,
    };
  }

  async deleteUser(id: string) {
    const result = await this.userRepo.delete({ user_id: id });
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
