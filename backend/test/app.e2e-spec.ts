import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('FoodsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api/foods (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/foods')
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('foods');
        expect(Array.isArray(res.body.foods)).toBe(true);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
