import { ConflictException, Injectable } from "@nestjs/common";
import { AgentsRepository } from "./agents.repository";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdatedAgentDto } from "./dto/update-agent.dto";
import { UploadsService } from "src/uploads/uploads.service";
import { Prisma } from "../../generated/prisma/client";
import { GetPublicAgentsDto } from "./dto/get-public-agents.dto";

@Injectable()
export class AgentsService {
  constructor(
    private agentsRepository: AgentsRepository,
    private uploadsService: UploadsService
  ) {}

  async getAllAgents() {
    return await this.agentsRepository.findAll();
  }

  async getAgentById(id: number) {
    return await this.agentsRepository.findById(id);
  }

  async addNewAgent(agent: CreateAgentDto) {
    return await this.agentsRepository.addAgent(agent);
  }

  async updateAgent(
    agent: UpdatedAgentDto,
    id: number,
    file?: Express.Multer.File
  ) {
    let photoUrl: string | undefined;

    if (file) {
      photoUrl = await this.uploadsService.uploadImage(file, "agents");
    }

    const parsedAgent = {
      ...agent,
      ...(agent.social_links && typeof agent.social_links === "string"
        ? { social_links: JSON.parse(agent.social_links) }
        : {}),
      ...(photoUrl && { photo_url: photoUrl }),
    };

    return await this.agentsRepository.updateAgent(parsedAgent, id);
  }

  async deleteAgent(id: number) {
    try {
      return await this.agentsRepository.deleteAgent(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ["P2003", "P2014"].includes(error.code)
      ) {
        throw new ConflictException(
          "Impossible de supprimer cet agent : il possède des réservations existantes."
        );
      }
      throw error;
    }
  }

  async searchAgents(name: string) {
    return await this.agentsRepository.searchAgents(name);
  }

  async getPublicAgents(query: GetPublicAgentsDto) {
  const { page = 1, limit = 10, category_id } = query;

  const [agents, total] = await Promise.all([
    this.agentsRepository.findAllPublic(page, limit, category_id),
    this.agentsRepository.countPublic(category_id),
  ]);

  const data = await Promise.all(
    agents.map(async (agent) => {
      const rating = await this.agentsRepository.getRatingSummary(agent.id);
      return {
        ...agent,
        rating_average: rating.average,
        rating_count: rating.count,
      };
    })
  );

  const totalPages = Math.ceil(total / limit); // arrondit vers le haut

  return {
    data, // infos des agents 
    meta: { // infos des pages 
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
}
