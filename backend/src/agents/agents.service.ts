import { Injectable } from "@nestjs/common";
import { AgentsRepository } from "./agents.repository";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdatedAgentDto } from "./dto/update-agent.dto";

@Injectable()
export class AgentsService {
  constructor(private agentsRepository: AgentsRepository) {}

  async getAllAgents() {
    return await this.agentsRepository.findAll();
  }

  async getAgentById(id: number) {
    return await this.agentsRepository.findById(id);
  }

  async addNewAgent(agent: CreateAgentDto) {
    return await this.agentsRepository.addAgent(agent);
  }

  async updateAgent(agent: UpdatedAgentDto, id: number) {
    return await this.agentsRepository.updateAgent(agent, id);
  }

  async deleteAgent(id: number) {
    return await this.agentsRepository.deleteAgent(id);
  }

  async searchAgents(name: string) {
    return await this.agentsRepository.searchAgents(name);
  }
}
