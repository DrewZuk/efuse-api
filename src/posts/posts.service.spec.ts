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
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
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

  describe('updatePost', () => {
    it('should update a post', async () => {
      const data = { content: 'changed' };
      const updatedPost = newPost(data);
      const id = updatedPost.id;

      jest
        .spyOn(postModel, 'findOneAndUpdate')
        // @ts-ignore
        .mockImplementation(async (filter, changes) => {
          expect(filter).toEqual({ id });
          expect(changes.content).toEqual(data.content);
          expect(changes.updated_time).toBeDefined();
          return updatedPost;
        });

      const result = await postsService.updatePost(id, data);
      expect(result).toEqual({
        id: updatedPost.id,
        content: updatedPost.content,
        user_id: updatedPost.user_id,
        created_time: updatedPost.created_time,
        updated_time: updatedPost.updated_time,
      });
    });

    it('should throw if post is not found', async () => {
      jest.spyOn(postModel, 'findOneAndUpdate').mockResolvedValue(null);

      await expect(
        postsService.updatePost(randomUUID(), { content: 'changed' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deletePost', () => {
    const deletedPost = newPost();

    it('should delete a post', async () => {
      jest.spyOn(postModel, 'findOneAndDelete').mockResolvedValue(deletedPost);

      const result = await postsService.deletePost(deletedPost.id);
      expect(result).toEqual(PostDto.fromSchema(deletedPost));

      expect(postModel.findOneAndDelete).toHaveBeenCalledWith({
        id: deletedPost.id,
      });
    });

    it('should throw if post is not found', async () => {
      jest.spyOn(postModel, 'findOneAndDelete').mockResolvedValue(null);

      await expect(postsService.getPost(deletedPost.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
