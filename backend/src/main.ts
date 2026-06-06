import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
});
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

 const config = new DocumentBuilder()
  .setTitle('CodeGuard AI API')
  .setDescription('DevSecOps project scanner API')
  .setVersion('1.0')
  .addTag('auth')
  .addTag('scans')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

const port = process.env.PORT || 3000;
await app.listen(port);

console.log(`CodeGuard AI API running on port ${port}`);

  console.log('CodeGuard AI API running on http://localhost:3000');
  console.log('Swagger docs running on http://localhost:3000/docs');
}

bootstrap();