// blocked-slots.controller.ts
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from "@nestjs/common";
import { BlockedSlotsService } from "./blocked-slots.service";
import { CreateBlockedSlotDto } from "./dto/create-blocked-slot.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@Controller("blocked-slots")
export class BlockedSlotsController {
  constructor(private blockedSlotsService: BlockedSlotsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMyBlockedSlots(@Req() req) {
    return this.blockedSlotsService.getMyBlockedSlots(req.user.sub);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post()
  async createBlockedSlot(@Req() req, @Body() body: CreateBlockedSlotDto) {
    return this.blockedSlotsService.createBlockedSlot(req.user.sub, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Delete(":id")
  async deleteMyBlockedSlot(@Req() req, @Param("id", ParseIntPipe) id: number) {
    return this.blockedSlotsService.deleteMyBlockedSlot(id, req.user.sub);
  }
}