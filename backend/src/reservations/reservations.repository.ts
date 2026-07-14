import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class reservationsRepository {
    constructor (private databaseService : DatabaseService){}

    async findAll() {
    const result = await this.databaseService.query(`
      SELECT
    reservations.id,
    reservations.client_id,
    reservations.agent_id,

    users.name AS client_name,
    users.phone AS client_phone,
    users.email AS client_email,
    users.ville AS client_ville,

    agents.name AS agent_name,
    agents.phone AS agent_phone,
    agents.email AS agent_email,
    agents.ville AS agent_ville,

    reservations.date_reservation,
    reservations.status,
    reservations.created_at

    FROM reservations

    JOIN users
    ON reservations.client_id = users.id

    JOIN agents
    ON reservations.agent_id = agents.id

    ORDER BY reservations.created_at DESC;
    `);
    return result.rows;//table mrig des reservations
  }

  async create(clientId: string, agentId: string, dateReservation: string) {

  // Verify client exists
  const clientResult = await this.databaseService.query(
    `
    SELECT id
    FROM users
    WHERE id = $1 AND role = 'CLIENT'
    LIMIT 1
    `,
    [clientId],
  );


  // Verify agent exists
  const agentResult = await this.databaseService.query(
    `
    SELECT id
    FROM agents
    WHERE id = $1
    LIMIT 1
    `,
    [agentId],
  );


  const client = clientResult.rows[0];
  const agent = agentResult.rows[0];


  if (!client) {
    throw new BadRequestException(
      `Le client avec l'ID ${clientId} n'existe pas.`
    );
  }


  if (!agent) {
    throw new BadRequestException(
      `L'agent avec l'ID ${agentId} n'existe pas.`
    );
  }



  // Insert only IDs (no duplicated information)
  const result = await this.databaseService.query(
    `
    INSERT INTO reservations
    (
      client_id,
      agent_id,
      date_reservation,
      status
    )

    VALUES
    ($1, $2, $3, 'EN_ATTENTE')

    RETURNING id
    `,
    [
      client.id,
      agent.id,
      dateReservation
    ],
  );


  const createdId = result.rows[0].id;



  // Return complete reservation information
  const createdReservation = await this.databaseService.query(
    `
    SELECT

      reservations.id,
      reservations.client_id,
      reservations.agent_id,


      users.name AS client_name,
      users.phone AS client_phone,
      users.email AS client_email,
      users.ville AS client_ville,


      agents.name AS agent_name,
      agents.phone AS agent_phone,
      agents.email AS agent_email,
      agents.ville AS agent_ville,


      reservations.date_reservation,
      reservations.status,
      reservations.created_at


    FROM reservations


    JOIN users
    ON reservations.client_id = users.id


    JOIN agents
    ON reservations.agent_id = agents.id


    WHERE reservations.id = $1

    LIMIT 1
    `,
    [createdId],
  );


  return createdReservation.rows[0];
}

  async updateReservation(id: number, part: { status?: string; date_reservation?: string }) {
    const fields = Object.keys(part);
    const values = Object.values(part);

    if (fields.length === 0) {
      return null;
    }

    const setQuery = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(', ');

    const query = `
      UPDATE reservations
      SET ${setQuery}
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;

    const result = await this.databaseService.query(
      query,
      [...values, id],
    );
    const updatedReservation = result.rows[0]; 
    return updatedReservation
  }

  async delete(id: number) {
    const result = await this.databaseService.query(
      'DELETE FROM reservations WHERE id = $1 RETURNING *',
      [id],
    );
    const deletedReservation = result.rows[0];  
    return deletedReservation
  }

}