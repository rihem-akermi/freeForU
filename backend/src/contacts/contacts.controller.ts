import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/createContact.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @ApiOperation({
    summary: 'Envoyer un message de contact',
    description: 'Route publique permettant à un visiteur d’envoyer un message via le formulaire.',
  })
  @ApiResponse({
    status: 201,
    description: 'Message de contact envoyé avec succès.',
  })
  @Post()
  async addContact(@Body() body: CreateContactDto) {
    const newContact = await this.contactsService.addContact(body);
    return newContact;
  }

  @ApiOperation({
    summary: 'Lister tous les messages de contact reçus',
    description: 'Retourne l’ensemble des messages reçus via le formulaire.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des messages retournée avec succès.',
  })
  @Get()
  async getContacts() {
    return await this.contactsService.getContacts();
  }

  @ApiCookieAuth('accessToken')
  @ApiOperation({
    summary: 'Supprimer un message de contact (Admin)',
    description: 'Supprime un message de contact identifié par son ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du message de contact',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Message de contact supprimé avec succès.',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Rôle ADMIN requis.' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async deleteContact(@Param('id', ParseIntPipe) id: number) {
    return await this.contactsService.deleteContact(id);
  }
}
