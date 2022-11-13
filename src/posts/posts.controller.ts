import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostsService } from './posts.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { ErrorDto } from './dto/error.dto';
import { GetPostDto } from './dto/get-post.dto';

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
}
