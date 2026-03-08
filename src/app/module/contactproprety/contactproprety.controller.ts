import {
  Controller,
  Post,
  Body,
  Req,
  Param,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactpropretyService } from './contactproprety.service';
import { CreateContactpropretyDto } from './dto/create-contactproprety.dto';
import { SendMessageDto } from './dto/send-message.dto';
import type { Request } from 'express';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helper/pick';

@Controller('contact-property')
export class ContactpropretyController {
  constructor(
    private readonly contactpropretyService: ContactpropretyService,
  ) {}

  // Reply
  @Post('send-message')
  @UseGuards(AuthGuard('user', 'agent'))
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Req() req: Request, @Body() dto: SendMessageDto) {
    const senderId = req.user!.id;
    const result = await this.contactpropretyService.sendMessage(senderId, dto);

    return {
      message: 'Message sent successfully',
      data: result,
    };
  }

  @Get('my-leads')
  @UseGuards(AuthGuard('agent'))
  @HttpCode(HttpStatus.OK)
  async getMyAllmyLeads(@Req() req: Request) {
    const userId = req.user!.id;

    const filters = pick(req.query, ['searchTerm', 'status']);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

    const result = await this.contactpropretyService.getMyAllmyLeads(
      userId,
      filters,
      options,
    );

    return {
      message: 'Leads retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('inquiry-history')
  @UseGuards(AuthGuard('user'))
  @HttpCode(HttpStatus.OK)
  async inquiryHistory(@Req() req: Request) {
    const userId = req.user!.id;

    const result = await this.contactpropretyService.inquiryHistory(userId);

    return {
      message: 'Inquiry history retrieved successfully',
      data: result,
    };
  }

  @Get('lead/:id')
  // @UseGuards(AuthGuard('agent'))
  @HttpCode(HttpStatus.OK)
  async getsingleLead(@Param('id') id: string) {
    const result = await this.contactpropretyService.getsingleLead(id);

    return {
      message: 'Lead retrieved successfully',
      data: result,
    };
  }

  // User first contact
  @Post(':propertyId')
  @UseGuards(AuthGuard('user', 'vendor', 'agent'))
  @HttpCode(HttpStatus.CREATED)
  async createContactProperty(
    @Req() req: Request,
    @Body() dto: CreateContactpropretyDto,
    @Param('propertyId') propertyId: string,
  ) {
    const userId = req.user!.id;

    const result = await this.contactpropretyService.createContactProperty(
      userId,
      dto,
      propertyId,
    );

    return {
      message: 'Contact property created successfully',
      data: result,
    };
  }

  // Get full chat
  @Get(':contactId')
  @HttpCode(HttpStatus.OK)
  async getFullChat(@Param('contactId') contactId: string) {
    return this.contactpropretyService.getFullChat(contactId);
  }
}
