import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  Put,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import pick from 'src/app/helper/pick';

@ApiTags('faq')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  @ApiOperation({
    summary: 'Faq is create',
  })
  @HttpCode(HttpStatus.CREATED)
  async createFaq(@Body() createFaqDto: CreateFaqDto) {
    const result = await this.faqService.createFaq(createFaqDto);

    return {
      message: 'Faq create successfully!!!',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all Faq',
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'question',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'answare',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  async findAllFaq(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'question', 'answare']);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.faqService.getAllFaq(filters, options);

    return {
      message: 'Faq get successfully!!!',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single Faq by id',
  })
  @HttpCode(HttpStatus.OK)
  async findOneFaq(@Param('id') id: string) {
    const result = await this.faqService.getSingleFaq(id);

    return {
      message: 'Faq get successfully!!!',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Faq by id',
  })
  @HttpCode(HttpStatus.OK)
  async updateFaq(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    const result = await this.faqService.updateFaq(id, updateFaqDto);

    return {
      message: 'Faq update successfully!!!',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Faq by id',
  })
  @HttpCode(HttpStatus.OK)
  async removeFaq(@Param('id') id: string) {
    const result = await this.faqService.deleteFaq(id);

    return {
      message: 'Faq delete successfully!!!',
      data: result,
    };
  }
}
