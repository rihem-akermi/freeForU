import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

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

  async create(clientId: number, agentId: number, dateReservation: string) {
    const result = await this.databaseService.query(
      `INSERT INTO reservations (client_id, agent_id, date_reservation)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [clientId, agentId, dateReservation],
    );
    const newReservation =  result.rows[0];
    return newReservation
  }

  async updateStatus(id: number, status: string) {
    const result = await this.databaseService.query(
      `UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id],
    );
    const updatedStatus = result.rows[0]; 
    return updatedStatus
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