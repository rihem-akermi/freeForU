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
          users.cin AS client_cin,
        reservations.agent_id,
          agents.cin AS agent_cin,
        users.name AS client_name,
        agents.name AS agent_name,
        reservations.date_reservation,
        reservations.status,
        reservations.created_at
      FROM reservations
      JOIN users ON reservations.client_id = users.id
      JOIN agents ON reservations.agent_id = agents.id
      ORDER BY reservations.created_at DESC
    `);
    return result.rows;//table mrig des reservations
  }

  async create(clientCin: string, agentCin: string, dateReservation: string) {
    const clientResult = await this.databaseService.query(
      `SELECT id, cin, name FROM users WHERE cin = $1 AND role = 'CLIENT' LIMIT 1`,
      [clientCin],
    );

    const agentResult = await this.databaseService.query(
      `SELECT id, cin, name FROM agents WHERE cin = $1 LIMIT 1`,
      [agentCin],
    );

    const client = clientResult.rows[0];
    const agent = agentResult.rows[0];

    if (!client) {
      throw new BadRequestException(`Le client avec le CIN ${clientCin} n'existe pas.`);
    }

    if (!agent) {
      throw new BadRequestException(`L'agent avec le CIN ${agentCin} n'existe pas.`);
    }

    const result = await this.databaseService.query(
      `INSERT INTO reservations (client_id, agent_id, date_reservation, status)
       VALUES ($1, $2, $3, 'EN_ATTENTE')
       RETURNING id`,
      [client.id, agent.id, dateReservation],
    );

    const createdId = result.rows[0]?.id;
    const createdReservation = await this.databaseService.query(
      `SELECT 
        reservations.id,
        reservations.client_id,
        users.cin AS client_cin,
        reservations.agent_id,
        agents.cin AS agent_cin,
        users.name AS client_name,
        agents.name AS agent_name,
        reservations.date_reservation,
        reservations.status,
        reservations.created_at
      FROM reservations
      JOIN users ON reservations.client_id = users.id
      JOIN agents ON reservations.agent_id = agents.id
      WHERE reservations.id = $1
      LIMIT 1`,
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