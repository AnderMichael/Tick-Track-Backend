import { PartialType } from '@nestjs/swagger';
import { CreateServiceDetailsDto } from './create-service-details.dto';

export class UpdateServiceDetailsDto extends PartialType(
  CreateServiceDetailsDto,
) {}
