import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, MaxLength, MinLength } from 'class-validator';
import { COMMENT_CONTENT_MAX, COMMENT_CONTENT_MIN } from './shared';

export class UpdateCommentParamsDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}

export class UpdateCommentDto {
  @ApiProperty({
    description: 'The comment content',
    minimum: COMMENT_CONTENT_MIN,
    maximum: COMMENT_CONTENT_MAX,
  })
  @MinLength(COMMENT_CONTENT_MIN)
  @MaxLength(COMMENT_CONTENT_MAX)
  readonly content: string;
}
