import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthRepository {
  constructor(private databaseService: DatabaseService) {}

  async findUserByEmail(email : string ) {
     const userResult = await this.databaseService.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    return userResult
   }

   async findAgentByEmail(email : string){
    const agentResult = await this.databaseService.query(
      'SELECT * FROM agents WHERE email = $1',
      [email],
    );
    return agentResult
   }

  
}