import { Post } from '../schemas/post.schema';
import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  created_time: Date;

  @ApiProperty()
  updated_time: Date;

  static fromSchema(post: Post): PostDto {
    return {
      id: post.id,
      content: post.content,
      user_id: post.user_id,
      created_time: post.created_time,
      updated_time: post.updated_time,
    };
  }
}
