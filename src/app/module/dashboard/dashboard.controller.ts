import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/app/middlewares/auth.guard';

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
}
