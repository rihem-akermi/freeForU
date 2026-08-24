import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ServicesRepository } from "./services.repository";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

@Injectable()
export class ServicesService {
  constructor(private servicesRepository: ServicesRepository) {}

  async getServicesByAgent(agentId: number) {
    return this.servicesRepository.findByAgentId(agentId);
  }

  async getMyServices(agentId: number) {
    return this.servicesRepository.findByAgentId(agentId);
  }

  async createService(agentId: number, dto: CreateServiceDto) {
    return this.servicesRepository.create(agentId, dto);
  }

  async updateService(id: number, agentId: number, dto: UpdateServiceDto) {
    const service = await this.servicesRepository.findById(id);

    if (!service) {
      throw new NotFoundException("Service introuvable");
    }
    if (service.agent_id !== agentId) {
      throw new ForbiddenException("Ce service ne vous appartient pas");
    }

    return this.servicesRepository.update(id, dto);
  }

  async deleteService(id: number, agentId: number) {
    const service = await this.servicesRepository.findById(id);

    if (!service) {
      throw new NotFoundException("Service introuvable");
    }
    if (service.agent_id !== agentId) {
      throw new ForbiddenException("Ce service ne vous appartient pas");
    }

    return this.servicesRepository.delete(id);
  }
}