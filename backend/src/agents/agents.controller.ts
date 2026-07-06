import { Controller } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { Get , Post , Patch , Delete ,Body , Param } from '@nestjs/common';

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
    async addAgent(@Body() body : {name : string , category:string , phone:string , password:string , ville:string , published:boolean})
    {
        const newAgent = await this.agentsService.addNewAgent(body.name , body.category , body.phone , body.password , body.ville , body.published)
        return newAgent 
    }

    @Patch(":id")
    async updateAgent(
        @Body() body:{published:boolean},
        @Param('id') id : string 
    ){
        const updatedAgent = await this.agentsService.updateAgent(body.published ,Number(id))
        return updatedAgent
    }

    @Delete(':id')
        async deleteAgent(@Param ('id') id : string){
            const deletedAgent = await this.agentsService.deleteAgent(Number(id))
            return deletedAgent
        }
    

}

