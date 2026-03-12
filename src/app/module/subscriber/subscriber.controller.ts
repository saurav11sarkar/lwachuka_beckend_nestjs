import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Put,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubscriberService } from './subscriber.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import pick from 'src/app/helper/pick';
import type { Request } from 'express';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('subscriber')
@Controller('subscriber')
export class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('admin'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create subscriber plan' })
  async createSubscriber(@Body() createSubscriberDto: CreateSubscriberDto) {
    const result = await this.subscriberService.create(createSubscriberDto);
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all subscriber plans' })
  async getAllSubscribers(@Req() req: Request) {
    const query = req.query;
    const filters = pick(query, [
      'searchTerm',
      'name',
      'description',
      'status',
    ]);
    const options = pick(query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.subscriberService.getAllSubscribers(
      filters,
      options,
    );
    return {
      message: 'All subscribers retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single subscriber plan by id' })
  @ApiParam({ name: 'id', description: 'Subscriber plan id' })
  async getSingleSubscriber(@Param('id') id: string) {
    const result = await this.subscriberService.getSingleSubscriber(id);
    return {
      message: 'Subscriber retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('admin'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update subscriber plan by id' })
  @ApiParam({ name: 'id', description: 'Subscriber plan id' })
  async updateSubscriber(
    @Param('id') id: string,
    @Body() updateSubscriberDto: UpdateSubscriberDto,
  ) {
    const result = await this.subscriberService.updateSubscriber(
      id,
      updateSubscriberDto,
    );
    return {
      message: 'Subscriber updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('admin'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete subscriber plan by id' })
  @ApiParam({ name: 'id', description: 'Subscriber plan id' })
  async deleteSubscriber(@Param('id') id: string) {
    const result = await this.subscriberService.deleteSubscriber(id);
    return {
      message: 'Subscriber deleted successfully',
      data: result,
    };
  }

  @Post('pad-listing/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('user', 'vendor'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Pay listing with saved flow' })
  @ApiParam({ name: 'id', description: 'Subscriber plan id' })
  async padListing(@Req() req: Request, @Param('id') id: string) {
    const result = await this.subscriberService.padListing(req.user!.id, id);
    return {
      message: 'Pad listing created successfully',
      data: result,
    };
  }

  @Post('pad-listing-mpesa/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('user', 'vendor', 'agent'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Initiate M-Pesa listing payment' })
  @ApiParam({ name: 'id', description: 'Subscriber plan id' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['phoneNumber'],
      properties: {
        phoneNumber: { type: 'string', example: '254712345678' },
      },
    },
  })
  async padListingMpesa(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { phoneNumber: string },
  ) {
    const result = await this.subscriberService.padListingMpesa(
      req.user!.id,
      id,
      body.phoneNumber,
    );
    return {
      message: 'M-Pesa STK Push initiated',
      data: result,
    };
  }
}
