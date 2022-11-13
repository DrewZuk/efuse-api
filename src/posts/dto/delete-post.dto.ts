import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeletePostDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}
