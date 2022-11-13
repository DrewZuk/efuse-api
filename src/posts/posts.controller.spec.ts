import { PostsController } from './posts.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { randomUUID } from 'crypto';

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
});

function repeatStr(str: string, len: number): string {
  let final = '';
  while (len--) {
    final += str;
  }
  return final;
}
