import { PostsController } from './posts.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { newPost } from './util.spec';
import { PostDto } from './dto/post.dto';

describe('PostsController', () => {
  let app: INestApplication;
  let postsService: PostsService;

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            createPost: jest.fn(),
            getPost: jest.fn(),
            getAllPosts: jest.fn(),
          },
        },
      ],
    }).compile();

    app = testModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    postsService = testModule.get(PostsService);

    await app.init();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createPost', () => {
    const validData = {
      content: 'some text',
      user_id: randomUUID(),
    };

    it('should create a post', async () => {
      const data = { ...validData };

      const createdPost = {
        ...data,
        id: randomUUID(),
        created_time: new Date(),
        updated_time: new Date(),
      };

      jest
        .spyOn(postsService, 'createPost')
        .mockImplementation(async () => createdPost);

      await request(app.getHttpServer())
        .post('/posts')
        .send(data)
        .expect(201)
        .expect(JSON.stringify(createdPost));

      expect(postsService.createPost).toHaveBeenCalledWith(data);
    });

    describe('request validations', () => {
      const scenarios = {
        'missing content': { user_id: validData.user_id },
        'missing user_id': { content: validData.content },
        'content too long': { ...validData, content: repeatStr('a', 50_001) },
        'invalid user_id': { ...validData, user_id: 'oops' },
      };

      Object.keys(scenarios).forEach((description) => {
        it(description, async () => {
          const data = scenarios[description];

          await request(app.getHttpServer())
            .post('/posts')
            .send(data)
            .expect(400);
        });
      });
    });
  });

  describe('getPost', () => {
    it('should return the fetched post', async () => {
      const id = randomUUID();
      const fetchedPost = {
        id,
        content: 'some text',
        user_id: randomUUID(),
        created_time: new Date(),
        updated_time: new Date(),
      };

      jest
        .spyOn(postsService, 'getPost')
        .mockImplementation(async () => fetchedPost);

      await request(app.getHttpServer())
        .get(`/posts/${id}`)
        .expect(200)
        .expect(JSON.stringify(fetchedPost));

      expect(postsService.getPost).toHaveBeenCalledWith(id);
    });

    it('should return 400 if id is not a uuid', async () => {
      await request(app.getHttpServer()).get(`/posts/not-a-uuid`).expect(400);
    });

    it('should return 404 if post is not found', async () => {
      const id = randomUUID();

      jest
        .spyOn(postsService, 'getPost')
        .mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer()).get(`/posts/${id}`).expect(404);
    });
  });

  describe('getAllPosts', () => {
    it('should return the fetched posts', async () => {
      const fetchedPosts = [newPost(), newPost()].map(PostDto.fromSchema);

      jest.spyOn(postsService, 'getAllPosts').mockResolvedValue(fetchedPosts);

      await request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect(JSON.stringify(fetchedPosts));
    });
  });
});

function repeatStr(str: string, len: number): string {
  let final = '';
  while (len--) {
    final += str;
  }
  return final;
}
