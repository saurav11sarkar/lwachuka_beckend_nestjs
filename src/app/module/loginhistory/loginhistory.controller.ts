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
import { LoginhistoryService } from './loginhistory.service';
import type { Request } from 'express';
import pick from 'src/app/helper/pick';
import { AuthGuard } from 'src/app/middlewares/auth.guard';

@Controller('loginhistory')
export class LoginhistoryController {
  constructor(private readonly loginhistoryService: LoginhistoryService) {}

  @Get()
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async getAllAduditLog(@Req() req: Request) {
    const options = pick(req.query, [
      'limit',
      'page',
      'skip',
      'sortBy',
      'sortOrder',
    ]);

    const result = await this.loginhistoryService.getAllAduditLog(options);

    return {
      message: 'Login history fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getSingleAduditLog(@Param('id') id: string) {
    const result = await this.loginhistoryService.getSingleAuditLog(id);

    return {
      message: 'Login history fetched successfully',
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteAduitLog(@Param('id') id: string) {
    const result = await this.loginhistoryService.deleteAuditLog(id);

    return {
      message: 'Login history deleted successfully',
      data: result,
    };
  }
}
