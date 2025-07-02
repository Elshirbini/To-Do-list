import { DataSource } from 'typeorm';
import { User } from './user/entities/user.entity';
import { Task } from './task/entities/task.entity';
import { env } from './config/env.config';
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: env.NODE_ENV === 'prod' ? 'mysql' : 'localhost',
  port: 3306,
  username: 'root',
  password: env.DB_PASSWORD,
  database: 'task',
  synchronize: false,
  entities: [User, Task],
  migrations: ['src/migrations/*.ts'],
});
