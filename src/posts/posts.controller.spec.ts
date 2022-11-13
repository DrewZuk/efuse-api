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
import { newComment, newPost } from './util.spec';
import { PostDto } from './dto/post.dto';
import { CommentDto } from './dto/comment.dto';

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
            updatePost: jest.fn(),
            deletePost: jest.fn(),
            addComment: jest.fn(),
            getComment: jest.fn(),
            getPostComments: jest.fn(),
            updateComment: jest.fn(),
            deleteComment: jest.fn(),
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

  describe('updatePost', () => {
    it('should update the post', async () => {
      const updatedPost = newPost();
      const id = updatedPost.id;
      const changes = { content: updatedPost.content };

      jest
        .spyOn(postsService, 'updatePost')
        .mockResolvedValue(PostDto.fromSchema(updatedPost));

      await request(app.getHttpServer())
        .put(`/posts/${id}`)
        .send(changes)
        .expect(200)
        .expect(JSON.stringify(PostDto.fromSchema(updatedPost)));

      expect(postsService.updatePost).toHaveBeenCalledWith(id, changes);
    });

    it('should return 400 if id is not a uuid', async () => {
      await request(app.getHttpServer()).put(`/posts/not-a-uuid`).expect(400);
    });

    it('should return 400 if the request is not valid', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${randomUUID()}`)
        .send(JSON.stringify({ content: repeatStr('a', 50_001) }))
        .expect(400);
    });

    it('should return 404 if post is not found', async () => {
      const id = randomUUID();

      jest
        .spyOn(postsService, 'updatePost')
        .mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .put(`/posts/${id}`)
        .send({ content: 'some text' })
        .expect(404);
    });
  });

  describe('deletePost', () => {
    it('should delete the post', async () => {
      const post = newPost();

      jest
        .spyOn(postsService, 'deletePost')
        .mockResolvedValue(PostDto.fromSchema(post));

      await request(app.getHttpServer())
        .delete(`/posts/${post.id}`)
        .expect(200)
        .expect(JSON.stringify(PostDto.fromSchema(post)));

      expect(postsService.deletePost).toHaveBeenCalledWith(post.id);
    });

    it('should return 400 if id is not a uuid', async () => {
      await request(app.getHttpServer())
        .delete(`/posts/not-a-uuid`)
        .expect(400);
    });

    it('should return 404 if post is not found', async () => {
      const id = randomUUID();

      jest
        .spyOn(postsService, 'deletePost')
        .mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer()).delete(`/posts/${id}`).expect(404);
    });
  });

  describe('addComment', () => {
    const post = newPost();
    const validData = {
      content: 'some text',
      user_id: randomUUID(),
    };

    it('should add the comment to the post', async () => {
      const data = { ...validData };

      const createdComment = newComment(data);

      jest
        .spyOn(postsService, 'addComment')
        .mockResolvedValue(CommentDto.fromSchema(createdComment));

      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .send(data)
        .expect(201)
        .expect(JSON.stringify(CommentDto.fromSchema(createdComment)));

      expect(postsService.addComment).toHaveBeenCalledWith(post.id, data);
    });

    describe('body validations', () => {
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
            .post(`/posts/${post.id}/comments`)
            .send(data)
            .expect(400);
        });
      });
    });

    it('should return 400 if the post ID is not a uuid', async () => {
      await request(app.getHttpServer())
        .post(`/posts/not-a-uuid/comments`)
        .send(validData)
        .expect(400);
    });

    it('should return 404 if the post is not found', async () => {
      jest
        .spyOn(postsService, 'addComment')
        .mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .send(validData)
        .expect(404);
    });
  });

  describe('getComment', () => {
    it('should return the fetched comment', async () => {
      const comment = CommentDto.fromSchema(newComment());

      jest
        .spyOn(postsService, 'getComment')
        .mockImplementation(async () => comment);

      await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(200)
        .expect(JSON.stringify(comment));

      expect(postsService.getComment).toHaveBeenCalledWith(comment.id);
    });

    it('should return 400 if id is not a uuid', async () => {
      await request(app.getHttpServer())
        .get(`/comments/not-a-uuid`)
        .expect(400);
    });

    it('should return 404 if comment is not found', async () => {
      const id = randomUUID();

      jest
        .spyOn(postsService, 'getComment')
        .mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer()).get(`/comments/${id}`).expect(404);
    });
  });

  describe('getPostComments', () => {
    const postId = randomUUID();

    it('should fetch all post comments', async () => {
      const comments = [
        CommentDto.fromSchema(newComment()),
        CommentDto.fromSchema(newComment()),
      ];

      jest.spyOn(postsService, 'getPostComments').mockResolvedValue(comments);

      await request(app.getHttpServer())
        .get(`/posts/${postId}/comments`)
        .expect(200)
        .expect(JSON.stringify(comments));

      expect(postsService.getPostComments).toHaveBeenCalledWith(postId);
    });

    it('should return 404 if the post is not found', async () => {
      jest
        .spyOn(postsService, 'getPostComments')
        .mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .get(`/posts/${postId}/comments`)
        .expect(404);
    });

    it('should return 400 if the post ID is not a valid uuid', async () => {
      await request(app.getHttpServer())
        .get(`/posts/not-a-uuid/comments`)
        .expect(400);
    });
  });

  describe('updateComment', () => {
    it('should update the comment', async () => {
      const comment = newComment();
      const data = { content: comment.content };

      jest
        .spyOn(postsService, 'updateComment')
        .mockResolvedValue(CommentDto.fromSchema(comment));

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}`)
        .send(data)
        .expect(200)
        .expect(JSON.stringify(PostDto.fromSchema(comment)));

      expect(postsService.updateComment).toHaveBeenCalledWith(comment.id, data);
    });

    it('should return 400 if id is not a uuid', async () => {
      await request(app.getHttpServer())
        .put(`/comments/not-a-uuid`)
        .expect(400);
    });

    it('should return 400 if the request is not valid', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${randomUUID()}`)
        .send(JSON.stringify({ content: repeatStr('a', 50_001) }))
        .expect(400);
    });

    it('should return 404 if comment is not found', async () => {
      const id = randomUUID();

      jest
        .spyOn(postsService, 'updateComment')
        .mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .put(`/comments1/${id}`)
        .send({ content: 'some text' })
        .expect(404);
    });
  });

  describe('deleteComment', () => {
    it('should delete the comment', async () => {
      const comment = newComment();

      jest
        .spyOn(postsService, 'deleteComment')
        .mockResolvedValue(CommentDto.fromSchema(comment));

      await request(app.getHttpServer())
        .delete(`/comments/${comment.id}`)
        .expect(200)
        .expect(JSON.stringify(CommentDto.fromSchema(comment)));

      expect(postsService.deleteComment).toHaveBeenCalledWith(comment.id);
    });

    it('should return 400 if id is not a uuid', async () => {
      await request(app.getHttpServer())
        .delete(`/comments/not-a-uuid`)
        .expect(400);
    });

    it('should return 404 if comment is not found', async () => {
      const id = randomUUID();

      jest
        .spyOn(postsService, 'deleteComment')
        .mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer()).delete(`/comments/${id}`).expect(404);
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
