import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FastifyRequest } from 'fastify';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  FileFieldsInterceptor,
  MemoryStorageFile,
  UploadedFiles,
} from '@blazity/nest-file-fastify';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  getAllUser() {
    return this.userService.getAllUser();
  }

  @Get('/profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: FastifyRequest) {
    return this.userService.getProfile(req);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async updateUser(
    @Param('id') id: string,
    @UploadedFiles() files: { image?: MemoryStorageFile },
    @Body() userData: UpdateUserDto,
  ) {
    const file = files.image?.[0] as MemoryStorageFile;

    return this.userService.updateUser(id, file, userData);
  }
  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
