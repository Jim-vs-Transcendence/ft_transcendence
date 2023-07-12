import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from 'src/util/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://10.14.9.5:5173'],
    credentials: true,
  });

  app.use(cookieParser());
  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();
