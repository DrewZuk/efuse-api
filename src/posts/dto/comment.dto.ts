import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../schemas/comment.schema';

export class CommentDto {
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

  static fromSchema(comment: Comment): CommentDto {
    return {
      id: comment.id,
      content: comment.content,
      user_id: comment.user_id,
      created_time: comment.created_time,
      updated_time: comment.updated_time,
    };
  }
}
