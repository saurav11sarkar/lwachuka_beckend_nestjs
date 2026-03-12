import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RecentActivityService } from './recent-activity.service';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helper/pick';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('recent-activity')
@Controller('recent-activity')
export class RecentActivityController {
  constructor(private readonly recentActivityService: RecentActivityService) {}

  @Get()
  @UseGuards(AuthGuard('user', 'agent', 'vendor', 'admin'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my recent activities' })
  async getAllMyRecentActivities(@Req() req: Request) {
    const userId = req.user!.id;
    console.log(userId);
    const filters = pick(req.query, [
      'searchTerm',
      'activityType',
      'description',
    ]);
    const options = pick(req.query, ['sortBy', 'sortOrder', 'page', 'limit']);
    const result = await this.recentActivityService.getAllMyRecentActivities(
      userId,
      filters,
      options,
    );

    return {
      message: 'Recent activity fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single recent activity by id' })
  @ApiParam({ name: 'id', description: 'Recent activity id' })
  async getSingleRecentActivity(@Param('id') id: string) {
    const result = await this.recentActivityService.getSingleRecentActivity(id);

    return {
      message: 'Recent activity fetched successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete recent activity by id' })
  @ApiParam({ name: 'id', description: 'Recent activity id' })
  async remove(@Param('id') id: string) {
    const result = await this.recentActivityService.deleteRecentActivity(id);

    return {
      message: 'Recent activity deleted successfully',
      data: result,
    };
  }
}
