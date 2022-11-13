import { Post } from './schemas/post.schema';
import { Comment } from './schemas/comment.schema';
import { PostsService } from './posts.service';
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { NotFoundException } from '@nestjs/common';
import { PostDto } from './dto/post.dto';
import { newComment, newPost } from './util.spec';
import { CommentDto } from './dto/comment.dto';
import { CacheService } from '../cache/cache.service';

describe('PostsService', () => {
  let postsService: PostsService;
  let postModel: Model<Post>;
  let commentModel: Model<Comment>;
  let cacheService: CacheService;

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
            exists: jest.fn(),
          },
        },
        {
          provide: getModelToken(Comment.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    postsService = module.get(PostsService);
    postModel = module.get(getModelToken(Post.name));
    commentModel = module.get(getModelToken(Comment.name));
    cacheService = module.get(CacheService);
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
    const cacheKey = `posts/${fetchedPost.id}`;

    it('should fetch a post', async () => {
      const postDto = {
        id: fetchedPost.id,
        content: fetchedPost.content,
        user_id: fetchedPost.user_id,
        created_time: fetchedPost.created_time,
        updated_time: fetchedPost.updated_time,
      };

      jest
        .spyOn(postModel, 'findOne')
        // @ts-ignore
        .mockImplementation(async () => fetchedPost);

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const result = await postsService.getPost(fetchedPost.id);
      expect(result).toEqual(postDto);

      expect(postModel.findOne).toHaveBeenCalledWith({ id: fetchedPost.id });
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.set).toHaveBeenCalledWith(cacheKey, postDto);
    });

    it('should fetch a post from cache', async () => {
      const post = PostDto.fromSchema(newPost());

      jest.spyOn(cacheService, 'get').mockResolvedValue(post);

      const result = await postsService.getPost(post.id);

      expect(result).toEqual(post);
      expect(postModel.findOne).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
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

      expect(cacheService.delete).toHaveBeenCalledWith(`posts/${id}`);
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
      expect(cacheService.delete).toHaveBeenCalledWith(
        `posts/${deletedPost.id}`,
      );
    });

    it('should throw if post is not found', async () => {
      jest.spyOn(postModel, 'findOneAndDelete').mockResolvedValue(null);

      await expect(
        postsService.deletePost(deletedPost.id),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('addComment', () => {
    const data = { content: 'some text', user_id: randomUUID() };
    const post = newPost();
    const comment = newComment({ post, ...data });

    it('should add the comment', async () => {
      // @ts-ignore
      jest.spyOn(postModel, 'exists').mockResolvedValue({ _id: post._id });
      // @ts-ignore
      jest.spyOn(commentModel, 'create').mockResolvedValue(comment);

      const result = await postsService.addComment(post.id, data);

      expect(result).toEqual(CommentDto.fromSchema(comment));

      expect(postModel.exists).toHaveBeenCalledWith({ id: post.id });
      expect(commentModel.create).toHaveBeenCalled();
    });

    it('should throw if the post is not found', async () => {
      jest.spyOn(postModel, 'exists').mockResolvedValue(null);

      await expect(
        postsService.addComment(post.id, data),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getComment', () => {
    const fetchedComment = newComment();

    it('should fetch a comment', async () => {
      jest.spyOn(commentModel, 'findOne').mockResolvedValue(fetchedComment);

      const result = await postsService.getComment(fetchedComment.id);
      expect(result).toEqual({
        id: fetchedComment.id,
        content: fetchedComment.content,
        user_id: fetchedComment.user_id,
        created_time: fetchedComment.created_time,
        updated_time: fetchedComment.updated_time,
      });

      expect(commentModel.findOne).toHaveBeenCalledWith({
        id: fetchedComment.id,
      });
    });

    it('should throw if comment is not found', async () => {
      jest.spyOn(commentModel, 'findOne').mockResolvedValue(null);

      await expect(
        postsService.getComment(fetchedComment.id),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getPostComments', () => {
    it('should return all post comments', async () => {
      const post = newPost();
      const comments = [newComment(), newComment()];

      jest.spyOn(postModel, 'findOne').mockResolvedValue(post);
      jest.spyOn(commentModel, 'find').mockResolvedValue(comments);

      const result = await postsService.getPostComments(post.id);

      expect(result).toEqual(comments.map(CommentDto.fromSchema));

      expect(postModel.findOne).toHaveBeenCalledWith({ id: post.id });
      expect(commentModel.find).toHaveBeenCalledWith({ post: post._id });
    });

    it('should throw if post is not found', async () => {
      const postId = randomUUID();

      jest.spyOn(postModel, 'findOne').mockResolvedValue(null);

      await expect(postsService.getPostComments(postId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateComment', () => {
    it('should update a comment', async () => {
      const data = { content: 'changed' };
      const updatedComment = newComment(data);
      const id = updatedComment.id;

      jest
        .spyOn(commentModel, 'findOneAndUpdate')
        // @ts-ignore
        .mockImplementation(async (filter, changes) => {
          expect(filter).toEqual({ id });
          expect(changes.content).toEqual(data.content);
          expect(changes.updated_time).toBeDefined();
          return updatedComment;
        });

      const result = await postsService.updateComment(id, data);
      expect(result).toEqual({
        id: updatedComment.id,
        content: updatedComment.content,
        user_id: updatedComment.user_id,
        created_time: updatedComment.created_time,
        updated_time: updatedComment.updated_time,
      });
    });

    it('should throw if comment is not found', async () => {
      jest.spyOn(commentModel, 'findOneAndUpdate').mockResolvedValue(null);

      await expect(
        postsService.updateComment(randomUUID(), { content: 'changed' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deleteComment', () => {
    const deletedComment = newComment();

    it('should delete a comment', async () => {
      jest
        .spyOn(commentModel, 'findOneAndDelete')
        .mockResolvedValue(deletedComment);

      const result = await postsService.deleteComment(deletedComment.id);
      expect(result).toEqual(CommentDto.fromSchema(deletedComment));

      expect(commentModel.findOneAndDelete).toHaveBeenCalledWith({
        id: deletedComment.id,
      });
    });

    it('should throw if comment is not found', async () => {
      jest.spyOn(commentModel, 'findOneAndDelete').mockResolvedValue(null);

      await expect(
        postsService.deleteComment(deletedComment.id),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
