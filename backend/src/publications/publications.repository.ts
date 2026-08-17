// publications.repository.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreatePublicationDto } from "./dto/create-publication.dto";
import { UpdatedPublicationDto } from "./dto/update-publication.dto";

@Injectable()
export class PublicationsRepository {
  constructor(private prisma: PrismaService) {}

  // Portfolio public d'un agent — visiteurs ne voient QUE les approuvées
  async findApprovedByAgentId(agentId: number) {
    return this.prisma.publications.findMany({
      where: { agent_id: agentId, status: "approuvee" },
      orderBy: { created_at: "desc" },
    });
  }

  // Vue de l'agent sur SES publications, tous statuts confondus
  async findAllByAgentId(agentId: number) {
    return this.prisma.publications.findMany({
      where: { agent_id: agentId },
      orderBy: { created_at: "desc" },
    });
  }


  async findPendingPubsByAgentId (agentId: number) {
    return this.prisma.publications.findMany({
      where: { agent_id: agentId ,status:"en_attente"},
      orderBy: { created_at: "desc" },
    });
  }
  // Vue admin — modération, tous statuts, tous agents
  async findAll() {
    return this.prisma.publications.findMany({
      include: { agents: { select: { id: true, name: true } } },
      orderBy: { created_at: "desc" },
    });
  }

  async findById(id: number) {
    return this.prisma.publications.findUnique({ where: { id } });
  }

  async findPending() {
    return this.prisma.publications.findMany({
      where: { status: "en_attente" },
      include: { agents: { select: { id: true, name: true } } },
      orderBy: { created_at: "asc" },
    });
  }

  async create(
    data: { titre: string; description: string; photo_url: string },
    agentId: number
  ) {
    return this.prisma.publications.create({
      data: { ...data, agent_id: agentId, status: "en_attente" },
    });
  }

  async update(dto: UpdatedPublicationDto, id: number) {
    return this.prisma.publications.update({ where: { id }, data: dto });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.publications.update({ where: { id }, data: { status } });
  }

  async delete(id: number) {
    return this.prisma.publications.delete({ where: { id } });
  }
}
