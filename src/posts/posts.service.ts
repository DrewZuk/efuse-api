import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async createPost(data: CreatePostDto): Promise<PostDto> {
    const post = await this.postModel.create(data);
    return PostDto.fromSchema(post);
  }

  async getPost(id: string): Promise<PostDto> {
    const post = await this.postModel.findOne({ id });

    if (!post) {
      throw new NotFoundException();
    }

    return PostDto.fromSchema(post);
  }

  async getAllPosts(): Promise<PostDto[]> {
    const posts = await this.postModel.find();

    return posts.map(PostDto.fromSchema);
  }
}
