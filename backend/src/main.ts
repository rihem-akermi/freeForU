import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);//port different de next.js 3000
  console.log('✅✅ Backend started on http://localhost:3001 ✅✅');

}

bootstrap();
