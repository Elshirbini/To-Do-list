import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { FastifyRequest } from 'fastify';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
  ) {}

  async create(req: FastifyRequest, createTaskDto: CreateTaskDto) {
    const userId = req.userId;

    createTaskDto.user_id = userId;

    const task = await this.taskRepo.save(createTaskDto);

    return {
      message: 'Task added successfully',
      task,
    };
  }

  async findAll(req: FastifyRequest) {
    const tasks = await this.taskRepo.find({
      where: { user_id: req.userId },
      order: {
        isPinned: 'DESC',
        createdAt: 'DESC',
      },
    });
    if (tasks.length === 0) throw new NotFoundException('Task not found');

    return { tasks };
  }

  async findOne(req: FastifyRequest, id: string) {
    const task = await this.taskRepo.findOneBy({
      task_id: id,
      user_id: req.userId,
    });
    if (!task) throw new NotFoundException('Task not found');

    return { task };
  }

  async update(req: FastifyRequest, id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepo.findOneBy({
      task_id: id,
      user_id: req.userId,
    });

    if (!task) throw new NotFoundException('Task not found');

    Object.assign(task, updateTaskDto);

    return {
      message: 'Task Updated Successfully',
      task: this.taskRepo.save(task),
    };
  }

  async remove(req: FastifyRequest, id: string) {
    const result = await this.taskRepo.delete({
      task_id: id,
      user_id: req.userId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Task not found');
    }
    return { message: 'Task deleted' };
  }
}
