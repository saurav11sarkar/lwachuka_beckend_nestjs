import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import pick from 'src/app/helper/pick';
import type { Request } from 'express';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('admin'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all payments' })
  async getAllPayments(@Req() req: Request) {
    const query = req.query;
    const filters = pick(query, [
      'searchTerm',
      'currency',
      'status',
      'paymentType',
    ]);
    const options = pick(query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.paymentService.getAllPayments(filters, options);
    return {
      message: 'All payments retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('vendor', 'agent'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my payments' })
  async getMyPayments(@Req() req: Request) {
    const query = req.query;
    const filters = pick(query, [
      'searchTerm',
      'currency',
      'status',
      'paymentType',
    ]);
    const options = pick(query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.paymentService.getMyPayments(
      req.user!.id,
      filters,
      options,
    );
    return {
      message: 'All payments retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('payment-overview')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get payment overview' })
  async paymentManagemant() {
    const result = await this.paymentService.paymentManagemant();
    return {
      message: 'Payment management data retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single payment by id' })
  @ApiParam({ name: 'id', description: 'Payment id' })
  async getSinglePayment(@Param('id') id: string) {
    const result = await this.paymentService.getSinglePayment(id);
    return {
      message: 'Payment retrieved successfully',
      data: result,
    };
  }
}
