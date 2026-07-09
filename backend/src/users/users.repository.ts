import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatedUserDto } from './dto/update-user.dto';

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

  async create(newUser: CreateUserDto) {
    console.log('➕ UsersRepository.create() called with :', newUser.cin, newUser.name, newUser.email, newUser.phone, newUser.role, newUser.ville);
    const result = await this.databaseService.query(
      `INSERT INTO users (cin, name, email, phone, password, role, ville)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [newUser.cin, newUser.name, newUser.email, newUser.phone, newUser.password, newUser.role, newUser.ville]
    );

    /*
    VALUES ($1, $2, $3, $4, $5) RETURNING *,
    [name, email, password, role, ville], );
    est plus securisé 
    */
    return result.rows[0]; 
  }

  async update(part: UpdatedUserDto, id: number) {
    console.log('✏️ UsersRepository.update() called pour id :', id);
    const fields = Object.keys(part);
    const values = Object.values(part);

    if (fields.length === 0) {
      return null;
    }

    const setQuery = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(', ');

    const query = `
      UPDATE users
      SET ${setQuery}
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;

    const result = await this.databaseService.query(query, [...values, id]);
    return result.rows[0];
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