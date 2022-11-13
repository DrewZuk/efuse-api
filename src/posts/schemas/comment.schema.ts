import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { Post } from './post.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({
    unique: true,
    index: true,
    required: true,
    default: () => randomUUID(),
  })
  id: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: Post.name, required: true })
  post: Post;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true, default: () => new Date() })
  created_time: Date;

  @Prop({ required: true, default: () => new Date() })
  updated_time: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
