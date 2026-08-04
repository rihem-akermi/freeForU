import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdatedAgentDto } from "./dto/update-agent.dto";

@Injectable()
export class AgentsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.agents.findMany({
      include: {
        categories: true,
      },
      orderBy: {
        id: "asc",
      },
    });

  /*
  probleme du category : 
  {
  "id": 1,
  "name": "Ali",
  "categories": {
    "id": 2,
    "nom": "Photographe"
  }
}
  */
    
  }

  async findById(id: number) {
    return this.prisma.agents.findUnique({
      where: {
        id,
      },
      include: {
        categories: true,
      },
    });
  }

  async addAgent(agent: CreateAgentDto) {
    return this.prisma.agents.create({
      data: {
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        ville: agent.ville,
        password: agent.password,
        category_id: agent.category_id,
        role: "AGENT",
      },
      include: {
        categories: true,
      },
    });
  }

  async updateAgent(agent: UpdatedAgentDto, id: number) {
    return this.prisma.agents.update({
      where: {
        id,
      },
      data: agent,
      include: {
        categories: true,
      },
    });
  }

  async deleteAgent(id: number) {
    return this.prisma.agents.delete({
      where: {
        id,
      },
    });
  }

  async searchAgents(name: string) {
    return this.prisma.agents.findMany({
      where: {
        name: {
          startsWith: name,
          mode: "insensitive",
        },
      },

      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        ville: true,
        categories: {
          select: {
            name: true,
          },
        },
      },

      orderBy: {
        name: "asc",
      },

      take: 10,
    });
  }
}
