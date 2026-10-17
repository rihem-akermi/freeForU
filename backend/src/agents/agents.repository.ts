import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdatedAgentDto } from "./dto/update-agent.dto";

const DEFAULT_AVATAR_URL =
  "https://res.cloudinary.com/cva509hz/image/upload/v1789212034/pdp.png";

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
        photo_url: DEFAULT_AVATAR_URL,
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

  // pagination dans l'accueil
  async findAllPublic(
    page: number,
    limit: number,
    categoryId?: number,
    ville?: string
  ) {
    console.log("Postgres a répond à cette requette 🏢");
    return this.prisma.agents.findMany({
      where: {
        ...(categoryId && { category_id: categoryId }),
        ...(ville && { ville: { equals: ville, mode: "insensitive" } }),
      },
      select: {
        id: true,
        name: true,
        ville: true,
        photo_url: true,
        bio: true,
        category_id: true,
        categories: { select: { name: true } },
      },
      orderBy: { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countPublic(categoryId?: number, ville?: string) {
    return this.prisma.agents.count({
      where: {
        ...(categoryId && { category_id: categoryId }),
        ...(ville && { ville: { equals: ville, mode: "insensitive" } }),//maj ou min ce n'est pas un probleme
      },
    });
  }

  async getRatingSummary(agentId: number) {
    const result = await this.prisma.reviews.aggregate({
      where: { agent_id: agentId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return { average: result._avg.rating ?? 0, count: result._count.rating };
  }
}
