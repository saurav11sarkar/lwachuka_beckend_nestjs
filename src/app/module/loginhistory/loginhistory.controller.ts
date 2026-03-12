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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('loginhistory')
@Controller('loginhistory')
export class LoginhistoryController {
  constructor(private readonly loginhistoryService: LoginhistoryService) {}

  @Get()
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all login history logs' })
  async getAllAduditLog(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'status']);
    const options = pick(req.query, [
      'limit',
      'page',
      'skip',
      'sortBy',
      'sortOrder',
    ]);

    const result = await this.loginhistoryService.getAllAduditLog(
      filters,
      options,
    );

    return {
      message: 'Login history fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('overview')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get login history overview' })
  async overViewAuditlog() {
    const result = await this.loginhistoryService.overViewAuditlog();
    return {
      message: 'Login history Overview fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single login history log by id' })
  @ApiParam({ name: 'id', description: 'Audit log id' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete login history log by id' })
  @ApiParam({ name: 'id', description: 'Audit log id' })
  async deleteAduitLog(@Param('id') id: string) {
    const result = await this.loginhistoryService.deleteAuditLog(id);

    return {
      message: 'Login history deleted successfully',
      data: result,
    };
  }
}
