import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({
    unique: true,
    index: true,
    required: true,
    default: () => randomUUID(),
  })
  id: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true, default: () => new Date() })
  created_time: Date;

  @Prop({ required: true, default: () => new Date() })
  updated_time: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
