import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecentActivityService } from './recent-activity.service';
import { CreateRecentActivityDto } from './dto/create-recent-activity.dto';
import { UpdateRecentActivityDto } from './dto/update-recent-activity.dto';

@Controller('recent-activity')
export class RecentActivityController {
  constructor(private readonly recentActivityService: RecentActivityService) {}

  @Post()
  create(@Body() createRecentActivityDto: CreateRecentActivityDto) {
    return this.recentActivityService.create(createRecentActivityDto);
  }

  @Get()
  findAll() {
    return this.recentActivityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recentActivityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecentActivityDto: UpdateRecentActivityDto) {
    return this.recentActivityService.update(+id, updateRecentActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recentActivityService.remove(+id);
  }
}
