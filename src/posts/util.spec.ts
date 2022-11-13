import { Post } from './schemas/post.schema';
import { randomUUID } from 'crypto';

export const newPost = (data: Partial<Post> = {}): Post => {
  return <Post>{
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
