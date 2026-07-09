import { CreateAgentDto } from "./create-agent.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdatedAgentDto extends PartialType(CreateAgentDto){
    /*or f 3oudh ParialType 
      name?: string;
      category?: string;
      phone?: string;
      password?: string;
      ville?: string;
      published?: boolean;
    
    */
}