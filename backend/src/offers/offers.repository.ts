import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdatedOfferDto } from "./dto/update-offer.dto";

@Injectable()
export class OffersRepository {
  constructor(private prisma: PrismaService) {}

  //page d'accueil client
  async findAllApprovedActive() {
    return this.prisma.offers.findMany({
      where: {
        status: "approuvee",
        active: true,
      },
      include: {
        agents: {
          select: {
            id: true,
            name: true,
            ville: true,
            photo_url: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  //Mes Offres
  async findByAgentId(agentId: number) {
    return this.prisma.offers.findMany({
      where: {
        agent_id: agentId,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  async findById(id: number) {
    return this.prisma.offers.findUnique({
      where: {
        id,
      },
      include: {
        agents: {
          select: {
            id: true,
            name: true,
            ville: true,
            photo_url: true,
          },
        },
      },
    });
  }

  async createOffer(offer: CreateOfferDto, agentId: number) {
    return this.prisma.offers.create({
      data: {
        ...offer,
        agent_id: agentId,
        status: "en_attente",
      },
    });
  }

  async updateOffer(offer: UpdatedOfferDto, id: number) {
    return this.prisma.offers.update({
      where: {
        id,
      },
      data: offer,
    });
  }

  async updateStatus(id: number, status: string) {
  return this.prisma.offers.update({
    where: { id },
    data: { status },
  });
}

  async deleteOffer(id: number) {
    return this.prisma.offers.delete({
      where: {
        id,
      },
    });
  }
}