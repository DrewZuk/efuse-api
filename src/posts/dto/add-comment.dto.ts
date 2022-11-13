import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, MaxLength, MinLength } from 'class-validator';

const CONTENT_MIN = 1;
const CONTENT_MAX = 10_000;

export class AddCommentParamsDto {
  @ApiProperty()
  @IsUUID()
  post_id: string;
}

export class AddCommentDto {
  @ApiProperty({
    description: 'The comment content',
    minimum: CONTENT_MIN,
    maximum: CONTENT_MAX,
  })
  @MinLength(CONTENT_MIN)
  @MaxLength(CONTENT_MAX)
  readonly content: string;

  @ApiProperty({ description: 'UUID of the user adding the comment' })
  @IsNotEmpty()
  @IsUUID()
  readonly user_id: string;
}
