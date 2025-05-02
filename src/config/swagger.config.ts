import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
export function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Tick Track Backend API')
    .setDescription('Core API for Tick Track operations')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}
