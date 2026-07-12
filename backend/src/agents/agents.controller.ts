import { Controller, UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { Get , Post , Patch , Delete ,Body , Param } from '@nestjs/common';
import { UpdatedAgentDto } from './dto/update-agent.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

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
    @UseGuards(AuthGuard,RolesGuard)
    @Roles("ADMIN")
    async addAgent(@Body() body : CreateAgentDto )
    {
        const newAgent = await this.agentsService.addNewAgent(body)
        return newAgent    
    }

    
    @Patch(":id")
    @UseGuards(AuthGuard,RolesGuard)
    @Roles("ADMIN")
    async updateAgent(
        @Body() body: Partial<UpdatedAgentDto>,
        @Param('id') id : number ){
        console.log("new infos about the agent : ", body)
        const updatedAgent = await this.agentsService.updateAgent(body,id)
        return updatedAgent
    }

    
    @Delete(':id')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles("ADMIN")
    async deleteAgent(@Param ('id') id : number){
            const deletedAgent = await this.agentsService.deleteAgent(id)
            return deletedAgent
        }
    

}

