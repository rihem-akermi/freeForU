import { Injectable } from '@nestjs/common';
import { AgentsRepository } from './agents.repository';
import { UpdatedAgentDto } from './dto/update-agent.dto';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
    constructor(private agentsRepository : AgentsRepository){}

    async getAllAgents(): Promise<any[]> {
        const agents = await this.agentsRepository.findAll()
        return agents 
    }

    async addNewAgent(newAgent :CreateAgentDto) : Promise<any>{
        const agent = this.agentsRepository.addAgent(newAgent)
        return agent 
    }

    async updateAgent(part : UpdatedAgentDto, id : number) : Promise<any>{
        const agent = this.agentsRepository.updateAgent(part, id)
        return agent 
    }

    async deleteAgent(id : number ) : Promise<any>{
        const agent = this.agentsRepository.deleteAgent(id)
        return agent 
    }

    async searchAgents(name: string) {
        return await this.agentsRepository.searchAgents(name);
    }
}
