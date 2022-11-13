import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeleteCommentDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}
