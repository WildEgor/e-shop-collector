import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppConfig } from '@config/app.config';
import { ConsumerConfig } from '@config/consumer.config';
import { AppModule } from './app.module';

const bootstrap = async(): Promise<void> => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const logger = new Logger('Bootstrap');

  app.enableCors();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const appConfig = app.get<AppConfig>(AppConfig);
  const consumerConfig = app.get<ConsumerConfig>(ConsumerConfig);

  app.connectMicroservice({
    ...consumerConfig.options,
    inheritAppConfig: true,
  });

  await app.startAllMicroservices();

  await app.listen(appConfig.port, '0.0.0.0', (_, address) => {
    logger.debug(`Service available on ${address}`);
  });
};

bootstrap().catch(e => {
  throw e;
});
