import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);// fabrique les constructeurs des objets  

  app.enableCors({
    origin: 'http://localhost:3000', // 👈 seul ton frontend Next.js a le droit d'appeler ce backend
  });
  console.log('🔓🔓 CORS activé pour http://localhost:3000 🔓🔓');

  await app.listen(3001);
  console.log('✅✅ Backend started on http://localhost:3001 ✅✅');
  //port different de next.js : 3000
  // onmoduleInit() declenche par app.init() declenché par app.listen(port)
   
}

bootstrap();
