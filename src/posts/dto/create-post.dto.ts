import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, MaxLength, MinLength } from 'class-validator';

const CONTENT_MIN = 1;
const CONTENT_MAX = 50_000;

export class CreatePostDto {
  @ApiProperty({
    description: 'The post content',
    minimum: CONTENT_MIN,
    maximum: CONTENT_MAX,
  })
  @MinLength(CONTENT_MIN)
  @MaxLength(CONTENT_MAX)
  readonly content: string;

  @ApiProperty({ description: 'UUID of the user creating the post' })
  @IsNotEmpty()
  @IsUUID()
  readonly user_id: string;
}
