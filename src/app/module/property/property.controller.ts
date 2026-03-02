import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  Get,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helper/fileUploder';
import type { Request } from 'express';
import pick from 'src/app/helper/pick';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('agent', 'admin'))
  @UseInterceptors(FilesInterceptor('images', 10, fileUpload.uploadConfig))
  async createProperty(
    @Req() req: Request,
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const userId = req.user!.id;

    const result = await this.propertyService.createProperty(
      userId,
      createPropertyDto,
      files,
    );
    return {
      message: 'Property created successfully',
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProperties(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'title',
      'listingType',
      'propertyType',
      'kitchenType',
      'location',
      'finishes',
      'balconyType',
      'storage',
      'coolingSystem',
      'moveInStatus',
      'description',
      'propertyCommunityAmenities',
      'purpose',
      'referenceNumber',
      'status',
      'price',
    ]);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.propertyService.getAllProperty(filters, options);

    return {
      message: 'All property retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('subscriber-property-top')
  @HttpCode(HttpStatus.OK)
  async getAllSubscriberUserPropertyTop(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'title',
      'listingType',
      'propertyType',
      'kitchenType',
      'location',
      'finishes',
      'balconyType',
      'storage',
      'coolingSystem',
      'moveInStatus',
      'description',
      'propertyCommunityAmenities',
      'purpose',
      'referenceNumber',
      'status',
    ]);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.propertyService.getAllSubscriberUserPropertyTop(
      filters,
      options,
    );

    return {
      message: 'Agent property retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('my-property')
  @UseGuards(AuthGuard('agent'))
  @HttpCode(HttpStatus.OK)
  async getMyPropertys(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'title',
      'listingType',
      'propertyType',
      'kitchenType',
      'location',
      'finishes',
      'balconyType',
      'storage',
      'coolingSystem',
      'moveInStatus',
      'description',
      'propertyCommunityAmenities',
      'purpose',
      'referenceNumber',
      'status',
    ]);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.propertyService.getMyAgentProperty(
      req.user!.id,
      filters,
      options,
    );

    return {
      message: 'Agent property retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('agent/:agentId')
  @HttpCode(HttpStatus.OK)
  async agentProperty(@Req() req: Request, @Param('agentId') agentId: string) {
    const filters = pick(req.query, [
      'searchTerm',
      'title',
      'listingType',
      'propertyType',
      'kitchenType',
      'location',
      'finishes',
      'balconyType',
      'storage',
      'coolingSystem',
      'moveInStatus',
      'description',
      'propertyCommunityAmenities',
      'purpose',
      'referenceNumber',
      'status',
    ]);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.propertyService.getMyAgentProperty(
      agentId,
      filters,
      options,
    );

    return {
      message: 'Agent property retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Put('status/:propertyId')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async approvedOrReject(
    @Param('propertyId') propertyId: string,
    @Body() updateStatus: { status: string },
  ) {
    const result = await this.propertyService.approvedOrReject(
      propertyId,
      updateStatus.status,
    );
    return {
      message: `Property ${result?.status} successfully`,
      data: result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getSingleProperty(@Param('id') id: string) {
    const result = await this.propertyService.getSingleProperty(id);

    return {
      message: 'Property retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('agent', 'admin'))
  async updateProperty(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    const userId = req.user!.id;
    const result = await this.propertyService.updateProperty(
      userId,
      id,
      updatePropertyDto,
    );

    return {
      message: 'Property updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('agent', 'admin'))
  async deleteProperty(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user!.id;
    const result = await this.propertyService.deleteProperty(userId, id);

    return {
      message: 'Property deleted successfully',
      data: result,
    };
  }
}
