import { Injectable } from "@nestjs/common";
import { Query, QueryResult } from "pg";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class AgentsRepository {
    constructor (private databaseService : DatabaseService){}

    async findAll(){
        const request : QueryResult = await this.databaseService.query("select * from agents")
        const allAgents = request.rows //table any[] 
        return allAgents
    }

    async addAgent(name : string , category:string , phone:string , password:string , ville:string , published:boolean){
        const result = await this.databaseService.query(`INSERT INTO agents (name, category, phone, password, ville ,published) 
            VALUES ($1, $2, $3, $4, $5,$6) 
            RETURNING *`,
            [name,category,phone,password,ville,published])
        const newRow =  result.rows[0] //the inserted row
        return newRow
    }

    async updateAgent(published : boolean , id : number ){
        const result = await this.databaseService.query(`update agents 
                                    set published = $1 
                                    where id = $2 
                                    RETURNING *`,
                                [published , id])
        const updatedAgent = result.rows[0]
        return updatedAgent
                            }

    async deleteAgent(id:number){
        const result = await this.databaseService.query(`delete from agents where id = $1 returning *`,[id])
        const deletedRow = result.rows[0]
        return deletedRow
    }
    
}