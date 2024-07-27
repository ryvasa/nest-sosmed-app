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

describe('Users', () => {
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

  describe('GET /users', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });
    it('should be rejected if not logged in', async () => {
      const response = await request(app.getHttpServer()).get('/users');

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to get users', async () => {
      const cookies = await loginAndGetCookie();

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should be able to search users by username not found', async () => {
      const cookies = await loginAndGetCookie();

      const response = await request(app.getHttpServer())
        .get(`/users`)
        .query({
          username: 'cobasasa',
        })
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search users by username', async () => {
      const cookies = await loginAndGetCookie();

      const response = await request(app.getHttpServer())
        .get(`/users`)
        .query({
          username: 'test',
        })
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
    it('should be able to search users with page', async () => {
      const cookies = await loginAndGetCookie();

      const response = await request(app.getHttpServer())
        .get(`/users`)
        .query({
          take: 1,
          skip: 0,
          username: 'test',
        })
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /users', () => {
    beforeEach(async () => {
      await testService.deleteAll();
    });
    it('should be rejected if not login', async () => {
      await loginAndGetCookie();
      const user = await testService.getUser();
      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send({
          username: '',
          password: '',
        });

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be rejected if email is invalid', async () => {
      const cookies = await loginAndGetCookie();
      const user = await testService.getUser();
      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send({
          email: 123,
        })
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to update username', async () => {
      const cookies = await loginAndGetCookie();
      const user = await testService.getUser();
      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send({
          username: 'updated',
        })
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('updated');
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.email).toBeDefined();
      expect(response.body.data.avatar).toBeDefined();
    });

    it('should be able update password', async () => {
      const cookies = await loginAndGetCookie();
      const user = await testService.getUser();
      let response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send({
          password: 'updated',
        })
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.email).toBe('test@gmail.com');

      response = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'test@gmail.com',
        password: 'updated',
      });
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should be able to update avatar', async () => {
      const cookies = await loginAndGetCookie();
      const user = await testService.getUser();
      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .set('Cookie', cookies)
        .field('username', 'updated')
        .attach('avatar', join(__dirname, 'image.png'));

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.email).toBeDefined();
      expect(response.body.data.avatar).toContain('/images/avatars/');

      testService.deleteImage(response.body.data.avatar);
    });
  });
});
