import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: {
        email,
      },
    });
  }


   async findAgentByEmail(email: string) {
    return this.prisma.agents.findFirst({
      where: {
        email,
      },
    });
  }


   async createUser(data: {
    name: string;
    email: string;
    password: string;
    ville: string;
    phone: string;
  }) {
    return this.prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "CLIENT",
        ville: data.ville,
        phone: data.phone,
      },
    });
  }

  
   async createAgent(data: {
    name: string;
    email: string;
    password: string;
    ville: string;
    phone: string;
    category_id: number;
  }) {
    return this.prisma.agents.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        ville: data.ville,
        password: data.password,
        category_id: data.category_id,
        role: "AGENT",
      },
    });
  }

}