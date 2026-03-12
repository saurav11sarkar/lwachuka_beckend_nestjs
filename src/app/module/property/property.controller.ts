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
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('property')
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('agent', 'admin'))
  @UseInterceptors(FilesInterceptor('images', 10, fileUpload.uploadConfig))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create property' })
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
  @ApiOperation({ summary: 'Get all properties' })
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

  @Get('get-all-pad-property-listing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all paid property listings' })
  async getAllPadPropertyListing(@Req() req: Request) {
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
    const result = await this.propertyService.getAllPadPropertyListing(
      filters,
      options,
    );

    return {
      message: 'All property retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('subscriber-property-top')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get top subscriber properties' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my properties' })
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
  @ApiOperation({ summary: 'Get properties by agent id' })
  @ApiParam({ name: 'agentId', description: 'Agent id' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve or reject property' })
  @ApiParam({ name: 'propertyId', description: 'Property id' })
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
  @ApiOperation({ summary: 'Get single property by id' })
  @ApiParam({ name: 'id', description: 'Property id' })
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
  @UseInterceptors(FilesInterceptor('images', 10, fileUpload.uploadConfig))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update property by id' })
  @ApiParam({ name: 'id', description: 'Property id' })
  async updateProperty(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const userId = req.user!.id;
    const result = await this.propertyService.updateProperty(
      userId,
      id,
      updatePropertyDto,
      files,
    );

    return {
      message: 'Property updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('agent', 'admin'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete property by id' })
  @ApiParam({ name: 'id', description: 'Property id' })
  async deleteProperty(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user!.id;
    const result = await this.propertyService.deleteProperty(userId, id);

    return {
      message: 'Property deleted successfully',
      data: result,
    };
  }
}
