import { Post } from './schemas/post.schema';
import { PostsService } from './posts.service';
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

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

      const createdPost = {
        _id: 'ObjectId-1',
        __v: 0,
        id: randomUUID(),
        created_time: new Date(),
        updated_time: new Date(),
        ...data,
      };

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
    });
  });
});
