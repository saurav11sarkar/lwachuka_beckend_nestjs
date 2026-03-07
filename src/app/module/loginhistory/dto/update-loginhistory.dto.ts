import { PartialType } from '@nestjs/mapped-types';
import { CreateLoginhistoryDto } from './create-loginhistory.dto';

export class UpdateLoginhistoryDto extends PartialType(CreateLoginhistoryDto) {}
