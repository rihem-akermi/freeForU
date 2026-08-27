import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from "@nestjs/common";
import { BlockedSlotsService } from "./blocked-slots.service";
import { CreateBlockedSlotDto } from "./dto/create-blocked-slot.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { SetDayExceptionDto } from "./dto/set-day-exception.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
} from "@nestjs/swagger";

@ApiTags("Blocked Slots")
@ApiCookieAuth("accessToken")
@Controller("blocked-slots")
export class BlockedSlotsController {
  constructor(private blockedSlotsService: BlockedSlotsService) {}

  @ApiOperation({
    summary: "Lister les créneaux bloqués de l'agent connecté",
    description: "Nécessite d'être authentifié en tant qu'agent.",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des créneaux bloqués et exceptions retournée avec succès.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMyBlockedSlots(@Req() req) {
    return this.blockedSlotsService.getMyBlockedSlots(req.user.sub);
  }

  @ApiOperation({
    summary: "Créer un créneau ou jour bloqué",
    description: "Bloque une date pour l'agent connecté (jour de repos ou journée pleine).",
  })
  @ApiResponse({
    status: 201,
    description: "Créneau bloqué enregistré avec succès.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post()
  async createBlockedSlot(@Req() req, @Body() body: CreateBlockedSlotDto) {
    return this.blockedSlotsService.createBlockedSlot(req.user.sub, body);
  }

  @ApiOperation({
    summary: "Définir ou basculer une exception journalière",
    description:
      "Définit une exception (`off` pour repos, `full` pour journée pleine) pour une date donnée.",
  })
  @ApiResponse({
    status: 201,
    description: "Exception enregistrée avec succès.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post("set-exception")
  async setDayException(@Req() req, @Body() body: SetDayExceptionDto) {
    return this.blockedSlotsService.setDayException(
      req.user.sub,
      body.date,
      body.type
    );
  }

  @ApiOperation({
    summary: "Supprimer une exception ou un créneau bloqué",
    description: "Supprime le blocage correspondant à l'ID pour l'agent connecté.",
  })
  @ApiParam({
    name: "id",
    description: "ID de l'exception / créneau bloqué",
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: "Créneau débloqué avec succès.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Delete(":id")
  async deleteMyBlockedSlot(@Req() req, @Param("id", ParseIntPipe) id: number) {
    return this.blockedSlotsService.deleteMyBlockedSlot(id, req.user.sub);
  }
}
