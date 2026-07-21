import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdatedAgentDto } from "./dto/update-agent.dto";

@Injectable()
export class AgentsRepository {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const result = await this.databaseService.query(`
      SELECT
      a.id,
      a.name,
      c.nom AS category,
      a.ville,
      a.email,
      a.phone,
      a.role

      FROM agents a

      LEFT JOIN categories c
      ON a.category_id = c.id

      ORDER BY a.id
      `);

    return result.rows;
  }

  async findById(id: number) {
    const result = await this.databaseService.query(
      `
    SELECT
    a.id,
    a.name,
    a.email,
    a.phone,
    a.ville,
    a.role,
    a.category_id,
    c.nom AS category,
    a.photo_url,
    a.bio,
    a.zone,
    a.service_mode,
    a.tarif_min,
    a.tarif_max,
    a.age,
    a.sexe,
    a.experience_years,
    a.social_links,
    a.id_card_url,
    a.work_certificate_url,
    a.verification_status

    FROM agents a

    LEFT JOIN categories c
    ON a.category_id = c.id

    WHERE a.id = $1
    `,
      [id]
    );
    console.log(`profile ${id} of from db` , result.rows[0])
    return result.rows[0];
  }

  async addAgent(agent: CreateAgentDto) {
    const insert = await this.databaseService.query(
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

    RETURNING id
    `,
      [
        agent.name,
        agent.email,
        agent.phone,
        agent.ville,
        agent.password,
        agent.category_id,
      ]
    );

    const id = insert.rows[0].id;

    const result = await this.databaseService.query(
      `
    SELECT
    a.id,
    a.name,
    c.nom AS category,
    a.email,
    a.phone,
    a.role

    FROM agents a

    LEFT JOIN categories c
    ON a.category_id = c.id

    WHERE a.id=$1
    `,
      [id]
    );

    return result.rows[0];
  }

  async updateAgent(agent: UpdatedAgentDto, id: number) {
    const fields = Object.keys(agent);
    const values = Object.values(agent);

    if (fields.length === 0) return null;

    const setQuery = fields
      .map((field, index) => `${field}=$${index + 1}`)
      .join(",");

    await this.databaseService.query(
      `
    UPDATE agents
    SET ${setQuery}
    WHERE id=$${fields.length + 1}
    `,
      [...values, id]
    );

    const result = await this.databaseService.query(
      `
    SELECT
    a.id,
    a.name,
    c.nom AS category,
    a.email,
    a.phone,
    a.role

    FROM agents a

    LEFT JOIN categories c
    ON a.category_id=c.id

    WHERE a.id=$1
    `,
      [id]
    );

    return result.rows[0];
  }

  async deleteAgent(id: number) {
    const result = await this.databaseService.query(
      `
    DELETE FROM agents
    WHERE id=$1
    RETURNING *
    `,
      [id]
    );

    return result.rows[0];
  }

  async searchAgents(name: string) {
    const result = await this.databaseService.query(
      `
  SELECT
  a.id,
  a.name,
  a.phone,
  a.email,
  a.ville,
  c.nom AS category

  FROM agents a

  LEFT JOIN categories c
  ON a.category_id=c.id

  WHERE a.name ILIKE $1

  ORDER BY a.name

  LIMIT 10
  `,
      [`${name}%`]
    );

    return result.rows;
  }
}
