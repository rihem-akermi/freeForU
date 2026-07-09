import { Controller } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { Get , Post , Patch , Delete ,Body , Param } from '@nestjs/common';
import { UpdatedAgentDto } from './dto/update-agent.dto';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('agents')
export class AgentsController {
    constructor(private agentsService : AgentsService){
    }

    @Get()
    async getAgents(){
        const agents = await this.agentsService.getAllAgents() 
        return agents
    }

    @Post()
    async addAgent(@Body() body : CreateAgentDto )
    {
        const newAgent = await this.agentsService.addNewAgent(body)
        return newAgent 
    }

    @Patch(":id")
    async updateAgent(
        @Body() body: Partial<UpdatedAgentDto>,
        @Param('id') id : string 
    ){
        console.log("new infos about the agent : ", body)
        const updatedAgent = await this.agentsService.updateAgent(body,Number(id))
        return updatedAgent
    }

    @Delete(':id')
        async deleteAgent(@Param ('id') id : string){
            const deletedAgent = await this.agentsService.deleteAgent(Number(id))
            return deletedAgent
        }
    

}

