import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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

  async updatePost(id: string, data: UpdatePostDto): Promise<PostDto> {
    const post = await this.postModel.findOneAndUpdate(
      { id },
      {
        ...data,
        updated_time: new Date(),
      },
      { new: true },
    );

    if (!post) {
      throw new NotFoundException();
    }

    return PostDto.fromSchema(post);
  }

  async deletePost(id: string): Promise<PostDto> {
    const post = await this.postModel.findOneAndDelete({ id });

    if (!post) {
      throw new NotFoundException();
    }

    return PostDto.fromSchema(post);
  }
}
