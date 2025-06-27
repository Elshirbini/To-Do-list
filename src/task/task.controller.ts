import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FastifyRequest } from 'fastify';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(201)
  create(@Req() req: FastifyRequest, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(req, createTaskDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: FastifyRequest) {
    return this.taskService.findAll(req);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Req() req: FastifyRequest, @Param('id') id: string) {
    return this.taskService.findOne(req, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Req() req: FastifyRequest,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(req, id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Req() req: FastifyRequest, @Param('id') id: string) {
    return this.taskService.remove(req, id);
  }
}
