import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { HttpExceptionFilter } from '../src/common/http-exception';
import { GlobalInterceptor } from '../src/interceptors/global.interceptor';

describe('Threads', () => {
  let app: INestApplication;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new GlobalInterceptor());
    app.use(cookieParser());

    await app.init();

    testService = app.get(TestService, { strict: false });
  });

  const loginAndGetCookie = async () => {
    const user = await testService.getUser();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        password: 'test',
        email: user.email,
      });

    expect(loginResponse.status).toBe(200);
    return loginResponse.headers['set-cookie'];
  };

  describe('POST /threads/:threadId/comments', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createThread();
    });
    it('should be rejected if not login', async () => {
      const thread = await testService.getThread();
      const response = await request(app.getHttpServer())
        .post(`/threads/${thread.id}/comments`)
        .send({ body: 'test' });

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if body is invalid', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.getThread();
      const response = await request(app.getHttpServer())
        .post(`/threads/${thread.id}/comments`)
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if thread not found', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.getThread();
      const response = await request(app.getHttpServer())
        .post(`/threads/${thread.id}l/comments`)
        .send({ body: 'test' })
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to create comment', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.getThread();
      const response = await request(app.getHttpServer())
        .post(`/threads/${thread.id}/comments`)
        .send({ body: 'test' })
        .set('Cookie', cookies);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.body).toBe('test');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(response.body.data.created_at).toBeDefined();
    });
  });
  describe('GET /threads/:threadId/comments', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createThread();
    });
    it('should be rejected if not logged in', async () => {
      const thread = await testService.getThread();
      await testService.createComment();
      const response = await request(app.getHttpServer()).get(
        `/threads/${thread.id}/comments`,
      );

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be reject if thread not found ', async () => {
      const cookies = await loginAndGetCookie();
      await testService.createComment();
      const thread = await testService.getThread();

      const response = await request(app.getHttpServer())
        .get(`/threads/${thread.id + 1}/comments`)
        .set('Cookie', cookies);
      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
    it('should be able to get comments from a thread', async () => {
      const cookies = await loginAndGetCookie();
      await testService.createComment();
      const thread = await testService.getThread();

      const response = await request(app.getHttpServer())
        .get(`/threads/${thread.id}/comments`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /threads/:threadId/comments/:commentId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
    });
    it('should be rejected if not logged in', async () => {
      const response = await request(app.getHttpServer()).get(
        '/threads/:threadId/comments/:commentId',
      );

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
    it('should be send not found error', async () => {
      const cookies = await loginAndGetCookie();
      const response = await request(app.getHttpServer())
        .get(`/threads/:threadId/comments/:commentId`)
        .set('Cookie', cookies);
      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to get a comment', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.createThread();
      const comment = await testService.createComment();
      const response = await request(app.getHttpServer())
        .get(`/threads/${thread.id}/comments/${comment.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.body).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(response.body.data.created_at).toBeDefined();
    });
  });

  describe('PATCH /threads/:threadId/comments/:commentId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createThread();
      await testService.createComment();
    });
    it('should be rejected if not login', async () => {
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      const response = await request(app.getHttpServer())
        .patch(`/threads/${thread.id}/comments/${comment.id}`)
        .send({
          body: '',
        });

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
    it('should be reject notfound comment', async () => {
      const thread = await testService.createThread();
      const cookies = await loginAndGetCookie();
      const comment = await testService.createComment();

      const response = await request(app.getHttpServer())
        .patch(`/threads/${thread.id}/comments/${comment.id + 1}`)
        .send({
          body: 'updated',
        })
        .set('Cookie', cookies);
      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be reject notfound thread', async () => {
      const thread = await testService.createThread();
      const comment = await testService.createComment();
      const cookies = await loginAndGetCookie();
      const response = await request(app.getHttpServer())
        .patch(`/threads/${thread.id + 1}/comments/${comment.id}`)
        .send({
          body: 'updated',
        })
        .set('Cookie', cookies);
      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if thread user and request user is not same', async () => {
      const thread = await testService.createThread();
      const comment = await testService.createComment();
      const response = await request(app.getHttpServer())
        .patch(`/threads/${thread.id}/comments/${comment.id}`)
        .set('Cookie', 'wrong_cookies');
      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
    it('should be rejected if body is invalid', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      const response = await request(app.getHttpServer())
        .patch(`/threads/${thread.id}/comments/${comment.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to update body', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      expect(comment.body).toBe('test');

      const response = await request(app.getHttpServer())
        .patch(`/threads/${thread.id}/comments/${comment.id}`)
        .send({
          body: 'updated',
        })
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.body).toBe('updated');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(response.body.data.created_at).toBeDefined();
    });
  });

  describe('DELETE /threads/:threadId/comments/:commentId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createThread();
    });
    it('should be rejected if not logged in', async () => {
      const thread = await testService.createThread();
      const comment = await testService.createComment();

      const response = await request(app.getHttpServer()).delete(
        `/threads/${thread.id}/comments/${comment.id}`,
      );

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be reject notfound comment', async () => {
      const thread = await testService.createThread();
      const cookies = await loginAndGetCookie();
      const comment = await testService.createComment();

      const response = await request(app.getHttpServer())
        .delete(`/threads/${thread.id}/comments/${comment.id + 1}`)
        .set('Cookie', cookies);
      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be reject notfound thread', async () => {
      const thread = await testService.createThread();
      const comment = await testService.createComment();
      const cookies = await loginAndGetCookie();
      const response = await request(app.getHttpServer())
        .delete(`/threads/${thread.id + 1}/comments/${comment.id}`)
        .set('Cookie', cookies);
      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if thread user and request user is not same', async () => {
      const thread = await testService.createThread();
      const comment = await testService.createComment();
      const response = await request(app.getHttpServer())
        .delete(`/threads/${thread.id}/comments/${comment.id}`)
        .set('Cookie', 'wrong_cookies');
      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
    it('should be able to delete a comment', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.createThread();
      const comment = await testService.createComment();

      const response = await request(app.getHttpServer())
        .delete(`/threads/${thread.id}/comments/${comment.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBeDefined();
    });
  });
});
