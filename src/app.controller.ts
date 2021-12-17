import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { AppService } from './app.service';
import { CarSessionPeriodDto, CreateCarSessionDto, CarSession, CarsUsageReport } from './app.dto';


@Controller('/api/cars')
export class AppController {
     constructor(private readonly appService: AppService) {}

     @Get('/usage-report')
     getCarsUsegeReport(
          @Query('year') year: string,
          @Query('month') month: string,
     ): Promise<CarsUsageReport[]> {
          return this.appService.getCarsUsageReport(+year, +month);
     }

     @Get(':id/availability')
     getCarAvailability(
          @Param('id') id: string,
          @Query('startDate') startDate: string,
          @Query('endDate') endDate: string,
     ): Promise<boolean> {
          return this.appService.checkCarAvailability(+id, { startDate, endDate });
     }

     @Get(':id/price')
     async getCarPrice(
          @Param('id') id: string,
          @Query('startDate') startDate: string,
          @Query('endDate') endDate: string,
     ): Promise<number> {
          return this.appService.getCarPrice(+id, { startDate, endDate });
     }

     @Post(':id/session')
     async createCarSession(
          @Param('id') id: string,
          @Body() data: CreateCarSessionDto,
     ): Promise<CarSession> {
          return this.appService.createCarSession(+id, data);
     }
}
