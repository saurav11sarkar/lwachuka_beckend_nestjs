import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/admin-overview')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async adminDashboradOverviw() {
    const result = await this.dashboardService.adminDashboradOverviw();

    return {
      message: 'admin dashboard overview',
      data: result,
    };
  }

  @Get('analytics-reports')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async analyticsReports() {
    const result = await this.dashboardService.analyticsReports();

    return {
      message: 'Dashboard data fetched successfully',
      data: result,
    };
  }

  @Get('agent-overview')
  @UseGuards(AuthGuard('agent'))
  @HttpCode(HttpStatus.OK)
  async agentDashboardOverview(@Req() req: Request) {
    const result = await this.dashboardService.agentDashboardOverview(
      req.user!.id,
    );

    return {
      message: 'Agent dashboard overview',
      data: result,
    };
  }

  @Get('user-overview')
  @UseGuards(AuthGuard('user'))
  @HttpCode(HttpStatus.OK)
  async userDashboardOverview(@Req() req: Request) {
    const result = await this.dashboardService.userDashboardOverview(
      req.user!.id,
    );

    return {
      message: 'User dashboard overview',
      data: result,
    };
  }
}
