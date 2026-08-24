import { PartialType } from "@nestjs/mapped-types";
import { CreateServiceDto } from "./create-service.dto";

// Reprend tous les champs de CreateServiceDto, mais tous optionnels
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}