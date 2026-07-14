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


   async createUser(data: { name: string; email: string; password: string; ville: string; phone: string }) {
  const result = await this.databaseService.query(
    `INSERT INTO users (name, email, password, role, ville, phone)
     VALUES ($1, $2, $3, 'CLIENT', $4, $5)
     RETURNING *`,
    [data.name, data.email, data.password, data.ville, data.phone],
  );
  return result.rows[0];
  }

  
  async createAgent(data: { name: string; email: string; password: string; ville: string; phone: string; category: string }) {
  const result = await this.databaseService.query(
    `INSERT INTO agents (name, email, password, role, ville, phone, category, published)
     VALUES ($1, $2, $3, 'AGENT', $4, $5, $6, false)
     RETURNING *`,
    [data.name, data.email, data.password, data.ville, data.phone, data.category],
  );
  return result.rows[0];
  }

}