import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { HttpExceptionFilter } from '../src/common/http-exception';
import { GlobalInterceptor } from '../src/interceptors/global.interceptor';
import { join } from 'path';

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
    await testService.createUser();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        password: 'test',
        email: 'test@gmail.com',
      });

    expect(loginResponse.status).toBe(200);
    return loginResponse.headers['set-cookie'];
  };

  describe('POST /threads', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });
    it('should be rejected if not login', async () => {
      const response = await request(app.getHttpServer())
        .post(`/threads`)
        .field('body', 'test')
        .attach('images', join(__dirname, 'image.png'))
        .attach('images', join(__dirname, 'image2.png'));

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if body is invalid', async () => {
      const cookies = await loginAndGetCookie();
      const response = await request(app.getHttpServer())
        .post(`/threads`)
        .attach('images', join(__dirname, 'image.png'))
        .attach('images', join(__dirname, 'image2.png'))
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if image is invalid', async () => {
      const cookies = await loginAndGetCookie();
      const response = await request(app.getHttpServer())
        .post(`/threads`)
        .field('body', 'test')
        .attach('images', join(__dirname, 'user.spec.ts'))
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to create thread with image', async () => {
      const cookies = await loginAndGetCookie();
      const response = await request(app.getHttpServer())
        .post(`/threads`)
        .field('body', 'test')
        .attach('images', join(__dirname, 'image.png'))
        .attach('images', join(__dirname, 'image2.png'))
        .set('Cookie', cookies);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.body).toBe('test');
      expect(response.body.data.images.length).toBeGreaterThan(0);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(response.body.data.created_at).toBeDefined();

      response.body.data.images.forEach(async (image) => {
        await testService.deleteImage(image.image);
      });
    });

    it('should be able to create thread without image', async () => {
      const cookies = await loginAndGetCookie();
      const response = await request(app.getHttpServer())
        .post(`/threads`)
        .field('body', 'test')
        .set('Cookie', cookies);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.body).toBe('test');
      expect(response.body.data.images.length).toBe(0);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(response.body.data.created_at).toBeDefined();
    });
  });
  describe('GET /threads', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });
    it('should be rejected if not logged in', async () => {
      const response = await request(app.getHttpServer()).get('/threads');

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to get threads', async () => {
      const cookies = await loginAndGetCookie();

      const response = await request(app.getHttpServer())
        .get('/threads')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should be able to search thread by body not found', async () => {
      const cookies = await loginAndGetCookie();

      const response = await request(app.getHttpServer())
        .get(`/threads`)
        .query({
          body: 'notfound',
        })
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search thread by body', async () => {
      const cookies = await loginAndGetCookie();
      await testService.createThread();

      const response = await request(app.getHttpServer())
        .get(`/threads`)
        .query({
          username: 'test',
        })
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should be able to search thread with page', async () => {
      const cookies = await loginAndGetCookie();
      await testService.createThread();

      const response = await request(app.getHttpServer())
        .get(`/threads`)
        .query({
          take: 1,
          skip: 0,
          body: 'test',
        })
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /threads/threadId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });
    it('should be rejected if not logged in', async () => {
      const response = await request(app.getHttpServer()).get(
        '/threads/threadId',
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
        .get('/threads/threadId')
        .set('Cookie', cookies);
      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to get a thread', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.createThread();
      const response = await request(app.getHttpServer())
        .get(`/threads/${thread.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.body).toBeDefined();
      expect(response.body.data.images).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(response.body.data.created_at).toBeDefined();
    });
  });

  describe('PATCH /threads/threadId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });
    it('should be rejected if not login', async () => {
      await loginAndGetCookie();
      const thread = await testService.createThread();
      const response = await request(app.getHttpServer())
        .patch(`/threads/${thread.id}`)
        .send({
          body: '',
        });

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if images is invalid', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.createThread();
      const response = await request(app.getHttpServer())
        .patch(`/threads/${thread.id}`)
        .attach('images', join(__dirname, 'user.spec.ts'))
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to update body', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.createThread();

      expect(thread.body).toBe('test');

      const response = await request(app.getHttpServer())
        .patch(`/threads/${thread.id}`)
        .field('body', 'updated')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.body).toBe('updated');
      expect(response.body.data.images).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(response.body.data.created_at).toBeDefined();
    });

    it('should be able to update images', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.createThread();
      expect(thread.images.length).toBe(0);

      const response = await request(app.getHttpServer())
        .patch(`/threads/${thread.id}`)
        .set('Cookie', cookies)
        .field('body', 'updated')
        .attach('images', join(__dirname, 'image.png'));

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.body).toBe('updated');
      expect(response.body.data.images.length).toBeGreaterThan(0);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(response.body.data.created_at).toBeDefined();

      response.body.data.images.forEach(async (image) => {
        await testService.deleteImage(image.image);
      });
    });
  });

  describe('DELETE /threads/threadId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });
    it('should be rejected if not logged in', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/threads/threadId',
      );

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if thread user and request user is not same', async () => {
      await testService.createUser();
      const thread = await testService.createThread();
      const response = await request(app.getHttpServer())
        .delete(`/threads/${thread.id}`)
        .set('Cookie', 'fake_cookies');

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
    it('should be send not found error', async () => {
      const cookies = await loginAndGetCookie();
      const response = await request(app.getHttpServer())
        .delete('/threads/threadId')
        .set('Cookie', cookies);
      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to delete a thread', async () => {
      const cookies = await loginAndGetCookie();
      const thread = await testService.createThread();
      const response = await request(app.getHttpServer())
        .delete(`/threads/${thread.id}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBeDefined();
    });
  });
});
