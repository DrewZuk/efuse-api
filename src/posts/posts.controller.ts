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

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
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

  @Get(':id')
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

  @Get()
  @ApiOperation({
    summary: 'Get all posts.',
    tags: ['posts'],
  })
  @ApiResponse({ status: 200, type: [PostDto] })
  @ApiResponse({ status: 500, type: ErrorDto })
  async getAllPosts() {
    return await this.postsService.getAllPosts();
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a post.',
    tags: ['posts'],
  })
  @ApiResponse({ status: 200, type: PostDto })
  @ApiResponse({ status: 400, type: ErrorDto })
  @ApiResponse({ status: 404, type: ErrorDto })
  @ApiResponse({ status: 500, type: ErrorDto })
  async updatePost(
    @Param() params: UpdatePostParamsDto,
    @Body() data: UpdatePostDto,
  ) {
    return await this.postsService.updatePost(params.id, data);
  }

  @Delete(':id')
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

  @Post('/:post_id/comments')
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
}
