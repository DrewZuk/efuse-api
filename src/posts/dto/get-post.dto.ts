import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetPostDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}
