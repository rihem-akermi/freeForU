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

    @UseGuards(AuthGuard,RolesGuard)
    @Roles("ADMIN")
    @Post()
    async addAgent(@Body() body : CreateAgentDto )
    {
        const newAgent = await this.agentsService.addNewAgent(body)
        return newAgent    
    }

    
    @UseGuards(AuthGuard,RolesGuard)
    @Roles("ADMIN")
    @Patch(":id")
    async updateAgent(
        @Body() body: Partial<UpdatedAgentDto>,
        @Param('id') id : number ){
        console.log("new infos about the agent : ", body)
        const updatedAgent = await this.agentsService.updateAgent(body,id)
        return updatedAgent
    }

    
    @UseGuards(AuthGuard,RolesGuard)
    @Roles("ADMIN")
    @Delete(':id')
    async deleteAgent(@Param ('id') id : number){
            const deletedAgent = await this.agentsService.deleteAgent(id)
            return deletedAgent
        }
    

}

