import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { HttpExceptionFilter } from '../src/common/http-exception';

describe('Authentication', () => {
  let app: INestApplication;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(cookieParser());

    await app.init();

    testService = app.get(TestService, { strict: false });
  });

  describe('POST /auth/register', () => {
    beforeEach(async () => {
      await testService.deleteUser();
    });
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
        });
      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to register', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'test',
          password: 'test',
          confirmPassword: 'test',
          email: 'test@gmail.com',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.email).toBe('test@gmail.com');
    });

    it('should be rejected if username already exist', async () => {
      await testService.createUser();
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'test',
          password: 'test',
          confirmPassword: 'test',
          email: 'test@gmail.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await testService.deleteUser();
    });
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: '',
          email: '',
        });
      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to login', async () => {
      await testService.createUser();
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'test',
          email: 'test@gmail.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.email).toBe('test@gmail.com');
    });
  });

  describe('GET /auth/me', () => {
    beforeEach(async () => {
      await testService.deleteUser();
    });
    it('should be rejected if not logged in', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to get authentication', async () => {
      await testService.createUser();

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'test',
          email: 'test@gmail.com',
        });

      expect(loginResponse.status).toBe(200);
      const cookies = loginResponse.headers['set-cookie'];

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.email).toBe('test@gmail.com');
    });
  });

  describe('DELETE /auth/logout', () => {
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
    });
    it('should be rejected if not logged in', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/auth/logout',
      );

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should be able to logout', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'test',
          email: 'test@gmail.com',
        });

      expect(loginResponse.status).toBe(200);
      const cookies = loginResponse.headers['set-cookie'];

      const response = await request(app.getHttpServer())
        .delete('/auth/logout')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });
});
