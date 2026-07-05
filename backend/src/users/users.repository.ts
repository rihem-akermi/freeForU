import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersRepository {
  constructor(private databaseService: DatabaseService) {
      // 👆 injection : Nest donne automatiquement l'instance partagée de DatabaseService
     // ya3ni k tetsan3 usersrepository toul nest ta3teha an existence instance of databaseService bech ykounouch multiple connexions 
    }

  async findAll() {
    console.log('📋 UsersRepository.findAll() is called');

    const result = await this.databaseService.query('SELECT * FROM users');
    console.log("table of " , result.rowCount , "rows")
    return result.rows; // tableau des lignes from PostgreSQL
  }

  async create(name: string, email: string, password: string, role: string, ville: string) {
    console.log('➕ UsersRepository.create() called with :', name, email, role, ville);
    const result = await this.databaseService.query(
      `INSERT INTO users (name, email, password, role, ville)
       VALUES (${name}, ${email}, ${password}, ${role}, ${ville})
       RETURNING *`
    );

    /*
    VALUES ($1, $2, $3, $4, $5) RETURNING *,
    [name, email, password, role, ville], );
    est plus securisé 
    */
    return result.rows[0]; // 👈 RETURNING * redonne la ligne cree
  }

  async delete(id: number) {
    console.log('🗑️ UsersRepository.delete() called pour id :', id);
    const result = await this.databaseService.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id],
    );
    return result.rows[0]; // undefined si l'id n'existait pas
  }

}