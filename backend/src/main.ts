import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from 'src/util/swagger';
import { NestExpressApplication } from '@nestjs/platform-express'
// import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  // app.enableCors()

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // app.use(cookieParser());
  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();
