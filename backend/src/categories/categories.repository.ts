import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class CategoriesRepository {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const result = await this.databaseService.query(
      `
SELECT 
id,
nom as name 

FROM categories

ORDER BY id
`
    );

    return result.rows;
  }

  async addCategory(name: string) {
    const result = await this.databaseService.query(
      `
      insert into categories (nom)
      values($1)
      returning id , nom as name `,
      [name]
    );
    return result.rows[0];
  }

  async updateCategory(id: number, name: string) {
    const result = await this.databaseService.query(
      `
      update categories 
      set nom = $1
      where id = $2
      returning id , nom as name `,
      [name, id]
    );
    return result.rows[0];
  }

  async delete(id: number) {
    return await this.databaseService.query(
      ` 
      delete from categories 
      where id = $1`,
      [id]
    );
  }
}
