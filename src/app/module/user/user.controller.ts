import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Req,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helper/fileUploder';
import { AuthGuard } from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helper/pick';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('profileImage', fileUpload.uploadConfig))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new user by admin' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.userService.createUser(createUserDto, file);

    return {
      message: 'User is create successfully',
      data: result,
    };
  }

  @Get('all-users')
  // @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  async findAllUsers(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'firstName',
      'lastName',
      'phoneNumber',
      'email',
      'role',
      'location',
      'address',
      'status',
    ]);

    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.userService.getAllUsers(filters, options);
    return {
      message: 'All users retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard('user', 'agent', 'vendor', 'admin'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my profile' })
  async findProfile(@Req() req: Request) {
    const result = await this.userService.getProfile(req.user!.id);
    return {
      message: 'User profile retrieved successfully',
      data: result,
    };
  }

  @Put('profile')
  @UseGuards(AuthGuard('user', 'agent', 'vendor', 'admin'))
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('profileImage', fileUpload.uploadConfig))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update my profile' })
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.userService.updateUserInfo(
      req.user!.id,
      updateUserDto,
      file,
    );
    return {
      message: 'User profile updated successfully',
      data: result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single user by id' })
  @ApiParam({ name: 'id', description: 'User id' })
  async findSingleUser(@Param('id') id: string) {
    const result = await this.userService.getSingleUser(id);
    return {
      message: 'User retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('profileImage', fileUpload.uploadConfig))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiParam({ name: 'id', description: 'User id' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.userService.updateUserInfo(
      id,
      updateUserDto,
      file,
    );
    return {
      message: 'User updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiParam({ name: 'id', description: 'User id' })
  async deleteUser(@Param('id') id: string) {
    const result = await this.userService.deleteUser(id);
    return {
      message: 'User deleted successfully',
      data: result,
    };
  }
}
