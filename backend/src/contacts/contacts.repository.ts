import { DatabaseService } from "src/database/database.service";
import { CreateContactDto } from "./dto/createContact.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ContactsRepository {
    constructor (private databaseService : DatabaseService){}


    async createContact (contact : CreateContactDto) {
        const result = await this.databaseService.query(`
            INSERT INTO contacts (name , email , message) 
            VALUES ($1 , $2 ,$3)
            returning * 
            `,[contact.name, contact.email , contact.message])

        return result.rows[0]
    }

    async getContacts (){
        const result = await this.databaseService.query(`
            select * from contacts 
            `)
        return result.rows
    }

    async deleteContact (id : number){
        const result = await this.databaseService.query(`
            DELETE FROM contacts 
            WHERE idcontact = $1 
            returning *`,
        [id])
        return result.rows[0]
    }

}