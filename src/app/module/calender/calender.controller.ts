import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Param,
  Get,
  Put,
  Delete,
} from '@nestjs/common';
import { CalenderService } from './calender.service';
import { CreateCalenderDto } from './dto/create-calender.dto';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helper/pick';
import { UpdateCalenderDto } from './dto/update-calender.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('calender')
@Controller('calender')
export class CalenderController {
  constructor(private readonly calenderService: CalenderService) {}

  @Post(':propertyId')
  @UseGuards(AuthGuard('user'))
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Book site visit for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property id' })
  async createCalender(
    @Req() req: Request,
    @Body() createCalenderDto: CreateCalenderDto,
    @Param('propertyId') propertyId: string,
  ) {
    const userId = req.user!.id;
    const result = await this.calenderService.createCalender(
      userId,
      createCalenderDto,
      propertyId,
    );

    return {
      message: 'Calender created successfully',
      data: result,
    };
  }

  @Get('my-bookings')
  @UseGuards(AuthGuard('user'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my bookings' })
  async getMyBookCalender(@Req() req: Request) {
    const userId = req.user!.id;
    const filters = pick(req.query, [
      'searchTerm',
      'firstName',
      'lastName',
      'email',
      'customMessage',
      'moveInData',
      'phone',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.calenderService.getMyBookCalender(
      userId,
      filters,
      options,
    );

    return {
      message: 'Calender retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('my-agent-bookings')
  @UseGuards(AuthGuard('agent'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my agent bookings' })
  async getMyAgentBookCalender(@Req() req: Request) {
    const userId = req.user!.id;
    const filters = pick(req.query, [
      'searchTerm',
      'firstName',
      'lastName',
      'email',
      'customMessage',
      'moveInData',
      'phone',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.calenderService.getMyAgentBookCalender(
      userId,
      filters,
      options,
    );

    return {
      message: 'Calender retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('visit-stats')
  @UseGuards(AuthGuard('agent', 'user'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get visit statistics' })
  async getVisitStats(@Req() req: Request) {
    const userId = req.user!.id;
    const role = req.user!.role;

    const result = await this.calenderService.getVisitStats(userId, role);

    return {
      message: 'Visit stats retrieved',
      data: result,
    };
  }

  @Get('upcoming-visits')
  @UseGuards(AuthGuard('user'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get upcoming visits' })
  async getAllUpcomingVisits(@Req() req: Request) {
    const agentId = req.user!.id;

    const result = await this.calenderService.getAllUpcomingVisits(agentId);

    return {
      message: 'Upcoming visits retrieved successfully',
      data: result,
    };
  }

  @Put('status/:id')
  @UseGuards(AuthGuard('agent'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update visit status' })
  @ApiParam({ name: 'id', description: 'Visit id' })
  async updateVisitStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const result = await this.calenderService.updateVisitStatus(
      id,
      body.status,
    );

    return {
      message: 'Visit status updated successfully',
      data: result,
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard('user'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update my booking by id' })
  @ApiParam({ name: 'id', description: 'Booking id' })
  async updateCalender(
    @Req() req: Request,
    @Body() updateCalenderDto: UpdateCalenderDto,
    @Param('id') id: string,
  ) {
    const userId = req.user!.id;
    const result = await this.calenderService.updateCalender(
      userId,
      id,
      updateCalenderDto,
    );

    return {
      message: 'Calender updated successfully',
      data: result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single booking by id' })
  @ApiParam({ name: 'id', description: 'Booking id' })
  async getMyCalenderById(@Param('id') id: string) {
    const result = await this.calenderService.getMyCalenderById(id);

    return {
      message: 'Calender retrieved successfully',
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('user'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete booking by id' })
  @ApiParam({ name: 'id', description: 'Booking id' })
  async deleteCalender(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user!.id;
    const result = await this.calenderService.deleteCalender(userId, id);

    return {
      message: 'Calender deleted successfully',
      data: result,
    };
  }
}
