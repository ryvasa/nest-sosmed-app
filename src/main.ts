import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/http-exception';
import { GlobalInterceptor } from './interceptors/global.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(passport.initialize());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new GlobalInterceptor());
  app.enableCors();
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
