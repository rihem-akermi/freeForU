import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateContactDto } from "./dto/createContact.dto";

@Injectable()
export class ContactsRepository {
  constructor(private prisma: PrismaService) {}

  async createContact(contact: CreateContactDto) {
    return this.prisma.contacts.create({
      data: {
        name: contact.name,
        email: contact.email,
        message: contact.message,
      },
    });
  }

  async getContacts() {
    return this.prisma.contacts.findMany();
  }

  async deleteContact(id: number) {
    return this.prisma.contacts.delete({
      where: {
        idcontact: id,
      },
    });
  }
}