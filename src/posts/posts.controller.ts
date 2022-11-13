import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { ErrorDto } from './dto/error.dto';
import { GetPostDto } from './dto/get-post.dto';
import { UpdatePostDto, UpdatePostParamsDto } from './dto/update-post.dto';
import { DeletePostDto } from './dto/delete-post.dto';
import { CommentDto } from './dto/comment.dto';
import { AddCommentDto, AddCommentParamsDto } from './dto/add-comment.dto';
import { GetCommentDto } from './dto/get-comment.dto';
import { GetPostCommentsDto } from './dto/get-post-comments.dto';
import {
  UpdateCommentDto,
  UpdateCommentParamsDto,
} from './dto/update-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('posts')
  @ApiOperation({
    summary: 'Create a new post.',
    tags: ['posts'],
  })
  @ApiResponse({ status: 201, type: PostDto })
  @ApiResponse({ status: 400, type: ErrorDto })
  @ApiResponse({ status: 500, type: ErrorDto })
  async createPost(@Body() body: CreatePostDto): Promise<PostDto> {
    return await this.postsService.createPost(body);
  }

  @Get('posts/:id')
  @ApiOperation({
    summary: 'Get a post.',
    tags: ['posts'],
  })
  @ApiResponse({ status: 200, type: PostDto })
  @ApiResponse({ status: 400, type: ErrorDto })
  @ApiResponse({ status: 404, type: ErrorDto })
  @ApiResponse({ status: 500, type: ErrorDto })
  async getPost(@Param() params: GetPostDto) {
    return await this.postsService.getPost(params.id);
  }

  @Get('posts')
  @ApiOperation({
    summary: 'Get all posts.',
    tags: ['posts'],
  })
  @ApiResponse({ status: 200, type: [PostDto] })
  @ApiResponse({ status: 500, type: ErrorDto })
  async getAllPosts() {
    return await this.postsService.getAllPosts();
  }

  @Delete('posts/:id')
  @ApiOperation({
    summary: 'Delete a post.',
    tags: ['posts'],
  })
  @ApiResponse({ status: 200, type: PostDto })
  @ApiResponse({ status: 400, type: ErrorDto })
  @ApiResponse({ status: 404, type: ErrorDto })
  @ApiResponse({ status: 500, type: ErrorDto })
  async deletePost(@Param() params: DeletePostDto) {
    return await this.postsService.deletePost(params.id);
  }

  @Post('posts/:post_id/comments')
  @ApiOperation({
    summary: 'Adds a new comment to a post.',
    tags: ['posts'],
  })
  @ApiResponse({ status: 201, type: CommentDto })
  @ApiResponse({ status: 400, type: ErrorDto })
  @ApiResponse({ status: 500, type: ErrorDto })
  async addComment(
    @Param() params: AddCommentParamsDto,
    @Body() body: AddCommentDto,
  ): Promise<PostDto> {
    return await this.postsService.addComment(params.post_id, body);
  }

  @Get('comments/:id')
  @ApiOperation({
    summary: 'Get a comment.',
    tags: ['posts'],
  })
  @ApiResponse({ status: 200, type: CommentDto })
  @ApiResponse({ status: 400, type: ErrorDto })
  @ApiResponse({ status: 404, type: ErrorDto })
  @ApiResponse({ status: 500, type: ErrorDto })
  async getComment(@Param() params: GetCommentDto) {
    return await this.postsService.getComment(params.id);
  }

  @Get('posts/:post_id/comments')
  @ApiOperation({
    summary: 'Get all comments for a single post.',
    tags: ['posts'],
  })
  @ApiResponse({ status: 200, type: [CommentDto] })
  @ApiResponse({ status: 400, type: ErrorDto })
  @ApiResponse({ status: 404, type: ErrorDto })
  @ApiResponse({ status: 500, type: ErrorDto })
  async getPostComments(@Param() params: GetPostCommentsDto) {
    return await this.postsService.getPostComments(params.post_id);
  }

  @Put('comments/:id')
  @ApiOperation({
    summary: 'Update a comment.',
    tags: ['posts'],
  })
  @ApiResponse({ status: 200, type: CommentDto })
  @ApiResponse({ status: 400, type: ErrorDto })
  @ApiResponse({ status: 404, type: ErrorDto })
  @ApiResponse({ status: 500, type: ErrorDto })
  async updateComment(
    @Param() params: UpdateCommentParamsDto,
    @Body() data: UpdateCommentDto,
  ) {
    return await this.postsService.updateComment(params.id, data);
  }

  @Delete('comments/:id')
  @ApiOperation({
    summary: 'Delete a comment.',
    tags: ['posts'],
  })
  @ApiResponse({ status: 200, type: CommentDto })
  @ApiResponse({ status: 400, type: ErrorDto })
  @ApiResponse({ status: 404, type: ErrorDto })
  @ApiResponse({ status: 500, type: ErrorDto })
  async deleteComment(@Param() params: DeleteCommentDto) {
    return await this.postsService.deleteComment(params.id);
  }
}
