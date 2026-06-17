import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e) - Google OAuth', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const testEmail = 'rahul.nair@gmail.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Clean up test user and associated data before each test
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    if (user) {
      await prisma.user.delete({
        where: { email: testEmail },
      });
    }
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    if (user) {
      await prisma.user.delete({
        where: { email: testEmail },
      });
    }
    await app.close();
  });

  it('/api/auth/google (POST) - should create new user, cart, and return isNewUser = true', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/google')
      .send({
        code: 'mock-auth-code',
        redirectUri: 'http://localhost:3000/login',
      })
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('tokens');
    expect(response.body.user.email).toBe(testEmail);
    expect(response.body.user.name).toBe('Rahul Nair');
    expect(response.body.user.provider).toBe('GOOGLE');
    expect(response.body.user.isNewUser).toBe(true);
    expect(response.body.user.profileImage).toBeDefined();

    // Verify cart and user exist in DB
    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { cart: true },
    });
    expect(dbUser).toBeDefined();
    expect(dbUser?.cart).toBeDefined();
    expect(dbUser?.welcomeEmailSent).toBe(true);
  });

  it('/api/auth/google (POST) - should link account and return isNewUser = false if email exists', async () => {
    // Pre-create credentials user
    await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Rahul Nair',
        password: 'hashed_password_placeholder',
        provider: 'credentials',
        welcomeEmailSent: false,
      },
    });

    const response = await request(app.getHttpServer())
      .post('/api/auth/google')
      .send({
        code: 'mock-auth-code',
        redirectUri: 'http://localhost:3000/login',
      })
      .expect(200);

    expect(response.body.user.email).toBe(testEmail);
    expect(response.body.user.provider).toBe('GOOGLE');
    expect(response.body.user.isNewUser).toBe(false);

    // Verify database record has been updated and welcomeEmailSent was NOT touched
    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    expect(dbUser?.provider).toBe('GOOGLE');
    expect(dbUser?.welcomeEmailSent).toBe(false); // Welcome email NOT sent for linked accounts
  });
});
