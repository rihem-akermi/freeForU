import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);// fabrique les constructeurs des objets  

  await app.listen(process.env.PORT ?? 3001);//port different de next.js 3000
  // onmoduleInit() declenche par app.init() declenché par app.listen(port)
  console.log('✅✅ Backend started on http://localhost:3001 ✅✅');

  const dbService = app.get(DatabaseService) //is build in nestJS 
  const date = await dbService.query('select now()')

  console.log(new Date(date.rows[0].now).toLocaleDateString())


}

bootstrap();
