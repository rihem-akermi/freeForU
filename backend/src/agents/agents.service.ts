import { Injectable } from "@nestjs/common";
import { AgentsRepository } from "./agents.repository";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdatedAgentDto } from "./dto/update-agent.dto";

@Injectable()
export class AgentsService {
  constructor(private agentsRepository: AgentsRepository) {}

  getAllAgents() {
    return this.agentsRepository.findAll();
  }

  getAgentById(id: number) {
    return this.agentsRepository.findById(id);
  }

  addNewAgent(agent: CreateAgentDto) {
    return this.agentsRepository.addAgent(agent);
  }

  updateAgent(agent: UpdatedAgentDto, id: number) {
    return this.agentsRepository.updateAgent(agent, id);
  }

  deleteAgent(id: number) {
    return this.agentsRepository.deleteAgent(id);
  }

  searchAgents(name: string) {
    return this.agentsRepository.searchAgents(name);
  }
}
