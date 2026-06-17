import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let emailService: EmailService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
    cart: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockEmailService = {
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('should throw ConflictException if user email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should hash password and create user and cart successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pass');
      
      const createdUser = {
        id: 'user_id',
        email: registerDto.email,
        name: registerDto.name,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
      };
      
      mockPrismaService.user.create = jest.fn().mockResolvedValue(createdUser);
      mockJwtService.signAsync.mockResolvedValue('token_val');

      const result = await service.register(registerDto);

      expect(result.user).toEqual(createdUser);
      expect(result.tokens.accessToken).toBe('token_val');
      expect(mockPrismaService.cart.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if user status is BLOCKED', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ password: 'hashed', status: UserStatus.BLOCKED });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should generate tokens and return user profile if credentials correct', async () => {
      const dbUser = {
        id: 'user_id',
        email: loginDto.email,
        name: 'Test',
        password: 'hashed',
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token_val');

      const result = await service.login(loginDto);

      expect(result.user.id).toBe('user_id');
      expect(result.tokens.accessToken).toBe('token_val');
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException if refresh token not found in DB', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh({ refreshToken: 'invalid' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException and delete token if expired', async () => {
      const expiredToken = {
        id: 'tok_id',
        expiresAt: new Date(Date.now() - 10000), // Past
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(expiredToken);

      await expect(service.refresh({ refreshToken: 'expired' })).rejects.toThrow(UnauthorizedException);
      expect(mockPrismaService.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'tok_id' } });
    });

    it('should throw ForbiddenException if user is blocked', async () => {
      const validToken = {
        id: 'tok_id',
        expiresAt: new Date(Date.now() + 10000),
        user: { status: UserStatus.BLOCKED },
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(validToken);

      await expect(service.refresh({ refreshToken: 'token' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('googleLogin', () => {
    const googleLoginDto = {
      code: 'mock-auth-code',
      redirectUri: 'http://localhost:3000/login',
    };

    it('should create a new user and cart, send welcome email, and generate tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      const createdUser = {
        id: 'new_google_user_id',
        email: 'rahul.nair@gmail.com',
        name: 'Rahul Nair',
        provider: 'GOOGLE',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        welcomeEmailSent: true,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
      };

      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockJwtService.signAsync.mockResolvedValue('token_val');

      const result = await service.googleLogin(googleLoginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'rahul.nair@gmail.com' },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'rahul.nair@gmail.com',
          name: 'Rahul Nair',
          provider: 'GOOGLE',
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          welcomeEmailSent: true,
          status: UserStatus.ACTIVE,
          role: Role.CUSTOMER,
        },
      });
      expect(mockPrismaService.cart.create).toHaveBeenCalledWith({
        data: { userId: 'new_google_user_id' },
      });
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith('Rahul Nair', 'rahul.nair@gmail.com');
      expect(result.user.isNewUser).toBe(true);
      expect(result.tokens.accessToken).toBe('token_val');
    });

    it('should link an existing non-Google user by updating provider and profileImage', async () => {
      const existingUser = {
        id: 'existing_user_id',
        email: 'rahul.nair@gmail.com',
        name: 'Rahul Nair',
        provider: 'credentials',
        profileImage: null,
        welcomeEmailSent: false,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      
      const updatedUser = {
        ...existingUser,
        provider: 'GOOGLE',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      };
      
      mockPrismaService.user.update.mockResolvedValue(updatedUser);
      mockJwtService.signAsync.mockResolvedValue('token_val');

      const result = await service.googleLogin(googleLoginDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'existing_user_id' },
        data: {
          provider: 'GOOGLE',
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        },
      });
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
      expect(result.user.isNewUser).toBe(false);
      expect(result.tokens.accessToken).toBe('token_val');
    });

    it('should NOT update user if returning Google user with same details', async () => {
      const existingUser = {
        id: 'existing_google_user_id',
        email: 'rahul.nair@gmail.com',
        name: 'Rahul Nair',
        provider: 'GOOGLE',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        welcomeEmailSent: true,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockJwtService.signAsync.mockResolvedValue('token_val');

      const result = await service.googleLogin(googleLoginDto);

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
      expect(result.user.isNewUser).toBe(false);
    });

    it('should throw ForbiddenException if user status is BLOCKED', async () => {
      const blockedUser = {
        id: 'blocked_user_id',
        email: 'rahul.nair@gmail.com',
        name: 'Rahul Nair',
        provider: 'GOOGLE',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        status: UserStatus.BLOCKED,
        role: Role.CUSTOMER,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(blockedUser);

      await expect(service.googleLogin(googleLoginDto)).rejects.toThrow(ForbiddenException);
    });
  });
});
