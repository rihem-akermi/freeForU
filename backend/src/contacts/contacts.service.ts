import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/createContact.dto';
import { ContactsRepository } from './contacts.repository';

@Injectable()
export class ContactsService {
    constructor(private contactRepository : ContactsRepository){}

    async addContact (contact : CreateContactDto){
        const newContact = await this.contactRepository.createContact(contact)
        return newContact
    }

    async getContacts (){
        return await this.contactRepository.getContacts()
    }

    async deleteContact(id : number){
        return await this.contactRepository.deleteContact(id) 
    }
}
