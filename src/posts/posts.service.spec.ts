import { Post } from './schemas/post.schema';
import { PostsService } from './posts.service';
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { NotFoundException } from '@nestjs/common';
import { PostDto } from './dto/post.dto';
import { newPost } from './util.spec';

describe('PostsService', () => {
  let postsService: PostsService;
  let postModel: Model<Post>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    postsService = module.get(PostsService);
    postModel = module.get(getModelToken(Post.name));
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const data = {
        user_id: randomUUID(),
        content: 'some text',
      };

      const createdPost = newPost(data);

      jest
        .spyOn(postModel, 'create')
        .mockImplementation(async () => createdPost);

      const result = await postsService.createPost(data);
      expect(result).toEqual({
        ...data,
        id: createdPost.id,
        created_time: createdPost.created_time,
        updated_time: createdPost.updated_time,
      });

      expect(postModel.create).toHaveBeenCalledWith(data);
    });
  });

  describe('getPost', () => {
    const fetchedPost = newPost();

    it('should fetch a post', async () => {
      jest
        .spyOn(postModel, 'findOne')
        // @ts-ignore
        .mockImplementation(async () => fetchedPost);

      const result = await postsService.getPost(fetchedPost.id);
      expect(result).toEqual({
        id: fetchedPost.id,
        content: fetchedPost.content,
        user_id: fetchedPost.user_id,
        created_time: fetchedPost.created_time,
        updated_time: fetchedPost.updated_time,
      });

      expect(postModel.findOne).toHaveBeenCalledWith({ id: fetchedPost.id });
    });

    it('should throw if post is not found', async () => {
      jest
        .spyOn(postModel, 'findOne')
        // @ts-ignore
        .mockImplementation(async () => null);

      await expect(postsService.getPost(fetchedPost.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getAllPosts', () => {
    it('should return all posts', async () => {
      const fetchedPosts = [newPost(), newPost()];
      jest.spyOn(postModel, 'find').mockResolvedValue(fetchedPosts);

      const result = await postsService.getAllPosts();
      expect(result).toEqual(fetchedPosts.map(PostDto.fromSchema));
    });
  });
});
