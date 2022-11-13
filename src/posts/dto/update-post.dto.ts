import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, MaxLength, MinLength } from 'class-validator';
import { POST_CONTENT_MAX, POST_CONTENT_MIN } from './shared';

export class UpdatePostParamsDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}

export class UpdatePostDto {
  @ApiProperty({
    description: 'The post content',
    minimum: POST_CONTENT_MIN,
    maximum: POST_CONTENT_MAX,
  })
  @MinLength(POST_CONTENT_MIN)
  @MaxLength(POST_CONTENT_MAX)
  readonly content: string;
}
