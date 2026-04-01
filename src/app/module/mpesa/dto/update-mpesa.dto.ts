import { PartialType } from '@nestjs/mapped-types';
import { CreateMpesaDto } from './create-mpesa.dto';

export class UpdateMpesaDto extends PartialType(CreateMpesaDto) {}
