import { Controller, Get, Param, Query, ParseIntPipe } from "@nestjs/common";
import { AvailabilityService } from "./availability.service";

@Controller("availability")
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get("agent/:agentId/day")
  async getDayAvailability(
    @Param("agentId", ParseIntPipe) agentId: number,
    @Query("date") date: string
  ) {
    console.log(
      "Date in getDayAvailability in availability.controller.ts "
      ,date,
      " ⏱️"
    )
    return this.availabilityService.getDayAvailability(agentId, date);
  }

  @Get("agent/:agentId")
  async getMonthCalendar(
    @Param("agentId", ParseIntPipe) agentId: number,
    @Query("year", ParseIntPipe) year: number,
    @Query("month", ParseIntPipe) month: number
  ) {
    return this.availabilityService.getMonthCalendar(agentId, year, month);
  }
}
