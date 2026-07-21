import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import PublicationDTO from "./dto/publications.dto";

@Injectable()
export default class PublicationsRepository {
  constructor(private databaseService: DatabaseService) {}

  async getMyPublications(id: number) {
    const result = await this.databaseService.query(
      `
            SELECT
    p.id,
    p.photo_url,
    p.description,
    p.status,
    p.created_at,
    a.name

    FROM publications p

    LEFT JOIN agents a
    ON p.agent_id = a.id

    WHERE p.id = $1
            `,
      [id]
    );
    return result.rows;
  }

  async createPublication(pub: PublicationDTO, agent_id: number) {
    const result = await this.databaseService.query(
      `
    INSERT INTO publications
    (
    photo_url,
    agent_id,
    description,
    status,
    )

    VALUES
    ($1,$2,$3,$4)

    RETURNING *
    `,
      [pub.photo_url, agent_id, pub.description, pub.statuts]
    );
    return result.rows[0];
  }
}
