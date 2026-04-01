import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import type { Request } from 'express';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helper/fileUploder';
import pick from 'src/app/helper/pick';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('advertisement')
@Controller('advertisement')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('vendor', 'admin'))
  @UseInterceptors(FileInterceptor('uploadMedia', fileUpload.uploadConfig))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create advertisement' })
  async createAdvertisement(
    @Req() req: Request,
    @Body() createAdvertisementDto: CreateAdvertisementDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user!.id;

    return this.advertisementService.createAdvertisement(
      userId,
      createAdvertisementDto,
      file,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all advertisements' })
  async getAllAdvertisements(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'companyName',
      'advertisementType',
      'targetRegions',
      'targetAudience',
      'compaingDuration',
    ]);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.advertisementService.getAllAdvertisement(
      filters,
      options,
    );

    return {
      message: 'All advertisements retrieved successfully',
      meta: result.meta,
      data: result.result,
    };
  }

  @Get('my-advertisement')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my advertisements' })
  async getMyAdvertisement(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'companyName',
      'advertisementType',
      'targetRegions',
      'targetAudience',
      'compaingDuration',
    ]);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.advertisementService.getMyAdvertisement(
      req.user!.id,
      filters,
      options,
    );

    return {
      message: 'My advertisements retrieved successfully',
      meta: result.meta,
      data: result.result,
    };
  }

  @Get('vendor/:vendorId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get advertisements by vendor id' })
  @ApiParam({ name: 'vendorId', description: 'Vendor id' })
  async getVendorAdvertisement(
    @Param('vendorId') vendorId: string,
    @Req() req: Request,
  ) {
    const filters = pick(req.query, [
      'searchTerm',
      'companyName',
      'advertisementType',
      'targetRegions',
      'targetAudience',
      'compaingDuration',
    ]);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.advertisementService.getVendorAdvertisement(
      vendorId,
      filters,
      options,
    );

    return {
      message: 'Vendor advertisements retrieved successfully',
      meta: result.meta,
      data: result.result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single advertisement by id' })
  @ApiParam({ name: 'id', description: 'Advertisement id' })
  async getAdvertisementById(@Param('id') id: string) {
    const result = await this.advertisementService.getAdvertisementById(id);
    return {
      message: 'Advertisement retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('vendor', 'admin'))
  @UseInterceptors(FileInterceptor('uploadMedia', fileUpload.uploadConfig))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update advertisement by id' })
  @ApiParam({ name: 'id', description: 'Advertisement id' })
  async updateMyAdvertisement(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateAdvertisementDto: UpdateAdvertisementDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user!.id;

    const result = await this.advertisementService.updateMyAdvertisement(
      userId,
      id,
      updateAdvertisementDto,
      file,
    );

    return {
      message: 'Advertisement updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('vendor', 'admin'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete advertisement by id' })
  @ApiParam({ name: 'id', description: 'Advertisement id' })
  async deleteMyAdvertisement(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user!.id;

    const result = await this.advertisementService.deleteMyAdvertisement(
      userId,
      id,
    );

    return {
      message: 'Advertisement deleted successfully',
      data: result,
    };
  }
}
