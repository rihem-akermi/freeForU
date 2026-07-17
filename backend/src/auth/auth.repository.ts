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

  
  async createAgent(data: { name: string; email: string; password: string; ville: string; phone: string; category_id: number }) {
  const result = await this.databaseService.query(
    `
    INSERT INTO agents
    (
    name,
    email,
    phone,
    ville,
    password,
    category_id,
    role
    )

    VALUES
    ($1,$2,$3,$4,$5,$6,'AGENT')

    RETURNING *
    `,
    [data.name, data.email, data.phone, data.ville, data.password, data.category_id],
  );
  return result.rows[0];
  }

}