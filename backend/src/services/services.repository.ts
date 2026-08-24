import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ServicesRepository {
  constructor(private prisma: PrismaService) {}

  async findByAgentId(agentId: number) {
    return this.prisma.services.findMany({
      where: { agent_id: agentId },
      orderBy: { created_at: "desc" },
    });
  }

  async findById(id: number) {
    return this.prisma.services.findUnique({
      where: { id },
    });
  }

  async create(
    agentId: number,
    dto: {
      nom: string;
      description?: string;
      typePrix: string;
      prix: number;
      dureeEstimee?: number;
    }
  ) {
    return this.prisma.services.create({
      data: {
        agent_id: agentId,
        nom: dto.nom,
        description: dto.description,
        type_prix: dto.typePrix,
        prix: dto.prix,
        duree_estimee: dto.dureeEstimee,
      },
    });
  }

  async update(
    id: number,
    dto: Partial<{
      nom: string;
      description: string;
      typePrix: string;
      prix: number;
      dureeEstimee: number;
    }>
  ) {
    return this.prisma.services.update({
      where: { id },
      data: {
        ...(dto.nom !== undefined && { nom: dto.nom }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.typePrix !== undefined && { type_prix: dto.typePrix }),
        ...(dto.prix !== undefined && { prix: dto.prix }),
        ...(dto.dureeEstimee !== undefined && {
          duree_estimee: dto.dureeEstimee,
        }),
      },
    });
  }

  async delete(id: number) {
    return this.prisma.services.delete({
      where: { id },
    });
  }
}