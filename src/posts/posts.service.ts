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
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CacheService } from '../cache/cache.service';

const cacheKeySinglePost = (id: string) => `posts/${id}`;
const cacheKeyAllPosts = () => 'posts';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    private readonly cacheService: CacheService,
  ) {}

  async createPost(data: CreatePostDto): Promise<PostDto> {
    const post = await this.postModel.create(data);
    return PostDto.fromSchema(post);
  }

  async getPost(id: string): Promise<PostDto> {
    const cacheKey = cacheKeySinglePost(id);

    const cached = await this.cacheService.get<PostDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const post = await this.postModel.findOne({ id });

    if (!post) {
      throw new NotFoundException();
    }

    const postDto = PostDto.fromSchema(post);

    await this.cacheService.set(cacheKey, postDto);

    return postDto;
  }

  async getAllPosts(): Promise<PostDto[]> {
    const cacheKey = cacheKeyAllPosts();

    const cached = await this.cacheService.get<PostDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const posts = await this.postModel.find();
    const postDtos = posts.map(PostDto.fromSchema);

    await this.cacheService.set(cacheKey, postDtos);

    return postDtos;
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

    await this.cacheService.delete(cacheKeySinglePost(id), cacheKeyAllPosts());

    return PostDto.fromSchema(post);
  }

  async deletePost(id: string): Promise<PostDto> {
    const post = await this.postModel.findOneAndDelete({ id });

    if (!post) {
      throw new NotFoundException();
    }

    await this.cacheService.delete(cacheKeySinglePost(id), cacheKeyAllPosts());

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

  async updateComment(id: string, data: UpdateCommentDto): Promise<CommentDto> {
    const comment = await this.commentModel.findOneAndUpdate(
      { id },
      {
        ...data,
        updated_time: new Date(),
      },
      { new: true },
    );

    if (!comment) {
      throw new NotFoundException();
    }

    return CommentDto.fromSchema(comment);
  }

  async deleteComment(id: string): Promise<CommentDto> {
    const comment = await this.commentModel.findOneAndDelete({ id });

    if (!comment) {
      throw new NotFoundException();
    }

    return CommentDto.fromSchema(comment);
  }
}
