import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/createContact.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('contacts')
export class ContactsController {
    constructor(private contactsService : ContactsService) {}
    
    @Post()
    async addContact (@Body() body :CreateContactDto) {
        const newContact = await this.contactsService.addContact(body)
        return newContact
    }

    @Get()
    async getContacts(){
        return await this.contactsService.getContacts()
    }

    @UseGuards(AuthGuard,RolesGuard)
    @Roles("ADMIN")
    @Delete(":id")
    async deleteContact(@Param("id") id : number ){
        return await this.contactsService.deleteContact(id)
    }
}
