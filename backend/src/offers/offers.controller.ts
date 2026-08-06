import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
  Query,
} from "@nestjs/common";

import { OffersService } from "./offers.service";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdatedOfferDto } from "./dto/update-offer.dto";

import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UpdateOfferStatusDto } from "./dto/update-offer-status.dto";

import { FileInterceptor } from "@nestjs/platform-express";
import { UseInterceptors, UploadedFile } from "@nestjs/common";

@Controller("offers")
export class OffersController {
  constructor(private offersService: OffersService) {}

  // page d'accueil client

  @Get()
  async getPublicOffers(@Query("category_id") categoryId?: string) {
    return this.offersService.getPublicOffers(
      categoryId ? Number(categoryId) : undefined
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMyOffers(@Req() req) {
    return this.offersService.getMyOffers(req.user.sub);
  }

  @Get("agent/:agentId")
  async getAgentOffers(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.offersService.getAgentOffers(agentId);
  }

  // Route dynamique publique, toujours en dernier
  // un modal : j'ai trop aimé l'idée : comme un cookie
  @Get(":id")
  async getOfferById(@Param("id", ParseIntPipe) id: number) {
    return this.offersService.getOfferById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post()
  @UseInterceptors(FileInterceptor("photo"))
  async createOffer(
    @Req() req,
    @Body() body: CreateOfferDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const result = await this.offersService.createOffer(
      body,
      req.user.sub,
      file
    );
    console.log("the offer as a result after treating it : ", result);
    return result;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch(":id/status")
  async updateOfferStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateOfferStatusDto
  ) {
    return this.offersService.updateOfferStatus(id, body.status);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Patch(":id")
  @UseInterceptors(FileInterceptor("photo"))
  async updateMyOffer(
    @Req() req,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdatedOfferDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    console.log(body.active, typeof body.active);
    return this.offersService.updateMyOffer(body, id, req.user.sub, file);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Delete(":id")
  async deleteMyOffer(@Req() req, @Param("id", ParseIntPipe) id: number) {
    return this.offersService.deleteMyOffer(id, req.user.sub);
  }
}
