import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/admin-overview')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get admin dashboard overview' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get analytics reports' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get agent dashboard overview' })
  @ApiQuery({ name: 'year', required: false, type: String, example: '2026' })
  async agentDashboardOverview(
    @Req() req: Request,
    @Query('year') year?: string,
  ) {
    const result = await this.dashboardService.agentDashboardOverview(
      req.user!.id,
      year ? Number(year) : undefined,
    );

    return {
      message: 'Agent dashboard overview',
      data: result,
    };
  }

  @Get('user-overview')
  @UseGuards(AuthGuard('user'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user dashboard overview' })
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
