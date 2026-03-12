import { PartialType } from '@nestjs/mapped-types';
import { CreateAdvertisementmanagementDto } from './create-advertisementmanagement.dto';

export class UpdateAdvertisementmanagementDto extends PartialType(
  CreateAdvertisementmanagementDto,
) {}
