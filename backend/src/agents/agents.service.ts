import { Injectable } from "@nestjs/common";
import { AgentsRepository } from "./agents.repository";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdatedAgentDto } from "./dto/update-agent.dto";
import { UploadsService } from "src/uploads/uploads.service";

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
    return await this.agentsRepository.deleteAgent(id);
  }

  async searchAgents(name: string) {
    return await this.agentsRepository.searchAgents(name);
  }
}
