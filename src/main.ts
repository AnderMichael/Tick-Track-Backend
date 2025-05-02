import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configVariables } from './config/environment.config';
import { setupSwagger } from './config/swagger.config';
import { HttpExceptionFilter } from './helpers/http_exception.filter';

const { version, port } = configVariables;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  const apiRoot = `/api/v${version}`;

  app.setGlobalPrefix(apiRoot);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  setupSwagger(app);
  await app.listen(port);
}

bootstrap();
