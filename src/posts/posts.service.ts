import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { CommentDto } from './dto/comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
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

  async addComment(postId: string, data: AddCommentDto): Promise<CommentDto> {
    const post = await this.postModel.exists({ id: postId });
    if (!post) {
      throw new NotFoundException();
    }

    const comment = await this.commentModel.create({
      ...data,
      post: post._id,
      created_time: new Date(),
      updated_time: new Date(),
    });

    return CommentDto.fromSchema(comment);
  }

  async getComment(id: string): Promise<CommentDto> {
    const comment = await this.commentModel.findOne({ id });

    if (!comment) {
      throw new NotFoundException();
    }

    return CommentDto.fromSchema(comment);
  }

  async getPostComments(postId: string): Promise<CommentDto[]> {
    const post = await this.postModel.findOne({ id: postId });

    if (!post) {
      throw new NotFoundException();
    }

    const comments = await this.commentModel.find({ post: post._id });

    return comments.map(CommentDto.fromSchema);
  }
}
