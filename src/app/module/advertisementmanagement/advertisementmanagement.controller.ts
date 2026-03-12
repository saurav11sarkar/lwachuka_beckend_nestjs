import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AdvertisementmanagementService } from './advertisementmanagement.service';
import { CreateAdvertisementmanagementDto } from './dto/create-advertisementmanagement.dto';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('advertisement-management')
@Controller('advertise-mentmanagement')
export class AdvertisementmanagementController {
  constructor(
    private readonly advertisementmanagementService: AdvertisementmanagementService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create advertisement management record' })
  async createAdvertisementmanagement(
    @Body() createAdvertisementmanagementDto: CreateAdvertisementmanagementDto,
  ) {
    const result =
      await this.advertisementmanagementService.createAdvertisementmanagement(
        createAdvertisementmanagementDto,
      );

    return {
      message: 'Advertisementmanagement created successfully',
      data: result,
    };
  }
}
