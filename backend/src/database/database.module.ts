import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global()
//ça veut dire que n'importe quel autre module de ton app pourra injecter Databaseservice
@Module({
  imports : [],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}