// reviews.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@Controller("reviews")
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Post()
  async createReview(@Req() req, @Body() body: CreateReviewDto) {
    return this.reviewsService.createReview(body, req.user.sub);
  }

  @Get("agent/:agentId/summary")
  async getAgentRatingSummary(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.reviewsService.getAgentRatingSummary(agentId);
  }

  @Get("agent/:agentId")
  async getAgentReviews(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.reviewsService.getAgentReviews(agentId);
  }
}