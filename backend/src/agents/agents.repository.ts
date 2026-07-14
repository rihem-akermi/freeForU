import { Injectable } from "@nestjs/common";
import { QueryResult } from "pg";
import { DatabaseService } from "src/database/database.service";
import { UpdatedAgentDto } from "./dto/update-agent.dto";
import { CreateAgentDto } from "./dto/create-agent.dto";

@Injectable()
export class AgentsRepository {
    constructor (private databaseService : DatabaseService){}

    async findAll(){
        const request : QueryResult = await this.databaseService.query("select * from agents")
        const allAgents = request.rows //table any[] 
        return allAgents
    }

    async addAgent(newAgent:CreateAgentDto){
        const result = await this.databaseService.query(`INSERT INTO agents (name, category, email, phone, password, ville ,published) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [newAgent.name,newAgent.category,newAgent.email,newAgent.phone,newAgent.password,newAgent.ville,newAgent.published])
            
        const newRow =  result.rows[0] //the inserted row
        return newRow
    }

    async updateAgent(agent : UpdatedAgentDto , id : number ){
        const fields = Object.keys(agent);

        const values = Object.values(agent);

        if (fields.length === 0) {
            return null; //nothing to update
        }

        const setQuery = fields
            .map((field, index) => `${field} = $${index + 1}`)
            .join(", ");

            //.join convert it to a string 

        const query = `
            UPDATE agents
            SET ${setQuery}
            WHERE id = $${fields.length + 1}
            RETURNING *
        `;
        
        const result = await this.databaseService.query(
            query,
            [...values, id] 
        );
        
        
        const updatedAgent = result.rows[0]
        return updatedAgent
                            }

    async deleteAgent(id:number){
        const result = await this.databaseService.query(`delete from agents where id = $1 returning *`,[id])
        const deletedRow = result.rows[0]
        return deletedRow
    }

    async searchAgents(name: string) {

  const result = await this.databaseService.query(
    `
    SELECT
      id,
      name,
      phone,
      ville,
      email

    FROM agents

    WHERE name ILIKE $1

    ORDER BY name

    LIMIT 10
    `,
    [`${name}%`],
  );


  return result.rows;
}
    
}