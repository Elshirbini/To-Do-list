import { env } from 'src/config/env.config';

export const emailQueueConfig = {
  connection: {
    host: env.NODE_ENV === 'prod' ? 'redis' : 'localhost',
    port: 6379,
  },
};
