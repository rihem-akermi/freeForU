import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import PublicationDTO from "./dto/publications.dto";

@Injectable()
export default class PublicationsRepository {

  constructor(private prisma: PrismaService) {}


  async getMyPublications(id: number) {

    return this.prisma.publications.findMany({
      where: {
        agent_id: id,
      },

      include: {
        agents: {
          select: {
            name: true,
          },
        },
      },
    });
  }


  async createPublication(pub: PublicationDTO, agent_id: number) {

    return this.prisma.publications.create({
      data: {
        photo_url: pub.photo_url,
        agent_id,
        description: pub.description,
        status: pub.statuts,
      },
    });
  }
}




// il est incopmlet (l'idée)