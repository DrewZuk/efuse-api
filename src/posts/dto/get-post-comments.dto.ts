import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetPostCommentsDto {
  @ApiProperty()
  @IsUUID()
  post_id: string;
}
