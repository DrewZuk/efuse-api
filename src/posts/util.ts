import { Post } from './schemas/post.schema';
import { Comment } from './schemas/comment.schema';
import { randomUUID } from 'crypto';

export const newPost = (
  data: Partial<Post> = {},
): Post & { _id: string; __v: number } => {
  return {
    _id: 'ObjectId-1',
    __v: 0,
    id: randomUUID(),
    user_id: randomUUID(),
    content: 'some text',
    created_time: new Date(),
    updated_time: new Date(),
    ...data,
  };
};

export const newComment = (data: Partial<Comment> = {}): Comment => {
  return <Comment>{
    _id: 'ObjectId-1',
    __v: 0,
    id: randomUUID(),
    user_id: randomUUID(),
    post: 'ObjectId-2',
    content: 'some text',
    created_time: new Date(),
    updated_time: new Date(),
    ...data,
  };
};
