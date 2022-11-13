import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetCommentDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}
