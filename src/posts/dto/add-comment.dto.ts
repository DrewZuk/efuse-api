import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, MaxLength, MinLength } from 'class-validator';
import { COMMENT_CONTENT_MAX, COMMENT_CONTENT_MIN } from './shared';

export class AddCommentParamsDto {
  @ApiProperty()
  @IsUUID()
  post_id: string;
}

export class AddCommentDto {
  @ApiProperty({
    description: 'The comment content',
    minimum: COMMENT_CONTENT_MIN,
    maximum: COMMENT_CONTENT_MAX,
  })
  @MinLength(COMMENT_CONTENT_MIN)
  @MaxLength(COMMENT_CONTENT_MAX)
  readonly content: string;

  @ApiProperty({ description: 'UUID of the user adding the comment' })
  @IsNotEmpty()
  @IsUUID()
  readonly user_id: string;
}
