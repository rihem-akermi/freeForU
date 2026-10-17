import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

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

  async findCheapest(categoryId: number, ville?: string, limit = 5) {
    return this.prisma.services.findMany({
      where: {
        agents: {
          category_id: categoryId,
          ...(ville && { ville: { equals: ville, mode: "insensitive" } }),
        },
      },
      select: {
        id: true,
        nom: true,
        description: true,
        prix: true,
        type_prix: true,
        agents: { select: { id: true, name: true, ville: true } },
      },
      orderBy: { prix: "asc" },
      take: limit,
    });
  }

  async create(agentId: number, dto: CreateServiceDto, embedding: number[]) {
    //
    return this.prisma.services.create({
      data: {
        agent_id: agentId,
        nom: dto.nom,
        description: dto.description,
        type_prix: dto.typePrix,
        prix: dto.prix,
        duree_estimee: dto.dureeEstimee,
        embedding, // ← ajout
      },
    });
  }

  async update(
    id: number,
    dto: Partial<UpdateServiceDto>,
    embedding?: number[]
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
        ...(embedding && { embedding }), // ← ajout
      },
    });
  }

  async delete(id: number) {
    return this.prisma.services.delete({
      where: { id },
    });
  }
}
