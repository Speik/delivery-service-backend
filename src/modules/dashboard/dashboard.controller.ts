import { Controller, Get, Query } from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { ParseUTCDatePipe } from '../../pipes';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats/general')
  public getGeneralStats(
    @Query('start', ParseUTCDatePipe) start: Date,
    @Query('end', ParseUTCDatePipe) end: Date,
  ) {
    return this.dashboardService.getGeneralStats(start, end);
  }

  @Get('stats/detailed')
  public getDetailedStats(
    @Query('start', ParseUTCDatePipe) start: Date,
    @Query('end', ParseUTCDatePipe) end: Date,
  ) {
    return this.dashboardService.getDetailedStats(start, end);
  }

  @Get('stats/daily')
  public getDailyStats(
    @Query('start', ParseUTCDatePipe) start: Date,
    @Query('end', ParseUTCDatePipe) end: Date,
  ) {
    return this.dashboardService.getDailyStats(start, end);
  }

  @Get('dishes/favorite')
  public getFavoriteDish(
    @Query('start', ParseUTCDatePipe) start: Date,
    @Query('end', ParseUTCDatePipe) end: Date,
  ) {
    return this.dashboardService.getFavoriteDish(start, end);
  }

  @Get('customers/platinum')
  public getPlatinumCustomer(
    @Query('start', ParseUTCDatePipe) start: Date,
    @Query('end', ParseUTCDatePipe) end: Date,
  ) {
    return this.dashboardService.getPlatinumCustomer(start, end);
  }

  @Get('orders/costly')
  public getCostlyOrder(
    @Query('start', ParseUTCDatePipe) start: Date,
    @Query('end', ParseUTCDatePipe) end: Date,
  ) {
    return this.dashboardService.getCostlyOrder(start, end);
  }
}
