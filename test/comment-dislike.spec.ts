import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { HttpExceptionFilter } from '../src/common/http-exception';
import { GlobalInterceptor } from '../src/interceptors/global.interceptor';

describe('Dislike Comments', () => {
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
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        password: 'test',
        email: 'test@gmail.com',
      });

    expect(loginResponse.status).toBe(200);
    return loginResponse.headers['set-cookie'];
  };

  describe('POST /threads/:threadId/comments/:commentId/dislike', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createThread();
      await testService.createComment();
    });
    it('should be rejected if not login', async () => {
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      const response = await request(app.getHttpServer()).post(
        `/threads/${thread.id}/comments/${comment.id}/dislike`,
      );

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if thread notfound', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      const response = await request(app.getHttpServer())
        .post(`/threads/${thread.id + 1}/comments/${comment.id}/dislike`)
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if comment notfound', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      const response = await request(app.getHttpServer())
        .post(`/threads/${thread.id}/comments/${comment.id + 1}/dislike`)
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to dislike comment', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      const response = await request(app.getHttpServer())
        .post(`/threads/${thread.id}/comments/${comment.id}/dislike`)
        .set('Cookie', cookies);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.dislike).toBe(true);
      expect(response.body.data.user_id).toBeDefined();
      expect(response.body.data.comment_id).toBeDefined();
    });
  });

  describe('DELETE /threads/:threadId/comments/:commentId/dislike', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createUser();
      await testService.createThread();
      await testService.createComment();
    });
    it('should be rejected if not login', async () => {
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      const response = await request(app.getHttpServer()).delete(
        `/threads/${thread.id}/comments/${comment.id}/dislike`,
      );

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if thread notfound', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      const response = await request(app.getHttpServer())
        .delete(`/threads/${thread.id + 1}/comments/${comment.id}/dislike`)
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if comment notfound', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      const response = await request(app.getHttpServer())
        .delete(`/threads/${thread.id}/comments/${comment.id + 1}/dislike`)
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if dislike user and request user is not same', async () => {
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      const response = await request(app.getHttpServer())
        .delete(`/threads/${thread.id}/comments/${comment.id}/dislike`)
        .set('Cookie', 'fake_cookies');

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able remove dislike comment', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.getThread();
      const comment = await testService.getComment();
      const user = await testService.getUser();
      await testService.createDislikeComment(comment.id, user.id);
      const response = await request(app.getHttpServer())
        .delete(`/threads/${thread.id}/comments/${comment.id}/dislike`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBeDefined();
    });
  });
});
