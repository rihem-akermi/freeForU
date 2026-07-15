import {
Controller,
Get,
Post,
Patch,
Delete,
Body,
Param,
Query,
UseGuards,
ParseIntPipe
} from '@nestjs/common';


import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdatedAgentDto } from './dto/update-agent.dto';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';



@Controller("agents")
export class AgentsController {


    constructor(private agentsService:AgentsService){}




@Get()
getAgents(){
return this.agentsService.getAllAgents();
}





@UseGuards(AuthGuard,RolesGuard)
@Roles("ADMIN")
@Post()
addAgent(
@Body() body:CreateAgentDto
){

return this.agentsService.addNewAgent(body);

}





@UseGuards(AuthGuard,RolesGuard)
@Roles("ADMIN")
@Patch(":id")
updateAgent(
@Param("id",ParseIntPipe) id:number,
@Body() body:UpdatedAgentDto
){

return this.agentsService.updateAgent(body,id);

}





@UseGuards(AuthGuard,RolesGuard)
@Roles("ADMIN")
@Delete(":id")
deleteAgent(
@Param("id",ParseIntPipe) id:number
){

return this.agentsService.deleteAgent(id);

}





@Get("search")
searchAgents(
@Query("name") name:string
){

return this.agentsService.searchAgents(name);

}


}