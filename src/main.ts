/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { ValidationPipe } from '@nestjs/common';
import fastifyHelmet from '@fastify/helmet';
import { emailWorker } from './jobs/emails/email.worker';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    { logger: ['error', 'warn', 'log', 'debug'] },
  );
  await app.register(
    fastifyHelmet as any,
    {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`, 'unpkg.com'],
          styleSrc: [
            `'self'`,
            `'unsafe-inline'`,
            'cdn.jsdelivr.net',
            'fonts.googleapis.com',
            'unpkg.com',
          ],
          fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'],
          imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
          scriptSrc: [
            `'self'`,
            `https: 'unsafe-inline'`,
            `cdn.jsdelivr.net`,
            `'unsafe-eval'`,
          ],
        },
      },
    } as any,
  );
  await app.register(fastifyCookie as any);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());

  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onRequest', (req: any, res: any, done: any) => {
      // Patch Fastify's response to behave more like Express
      res.setHeader = (key: string, value: string) => {
        return res.raw.setHeader(key, value);
      };
      res.end = (data?: any) => {
        res.raw.end(data);
      };
      req.res = res;

      done();
    });

  app
    .getHttpAdapter()
    .getInstance()
    .get('/', (req, reply) => {
      reply.type('text/html').send(`
        <html>
          <body>
            <h2>Login with Google</h2>
            <a href="/api/v1/auth/google">
              <button style="padding: 10px 20px; font-size: 16px;">Login with Google</button>
            </a>
          </body>
        </html>
      `);
    });

  await app.listen(3000, '0.0.0.0');

  emailWorker.on('completed', (job) => {
    console.log(`🎉 Completed job ${job.id}`);
  });

  emailWorker.on('failed', (job, err) => {
    console.error(`❌ Failed job ${job?.id}`, err);
  });
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
});
