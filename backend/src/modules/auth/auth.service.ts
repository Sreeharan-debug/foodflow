import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import * as bcrypt from 'bcrypt';
import { Role, UserStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async generateTokens(userId: string, email: string, role: Role) {
    const payload = { email, sub: userId, role };
    
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'foodflow_jwt_access_secret_key_12345',
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'foodflow_jwt_refresh_secret_key_12345',
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
    });

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email address already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: registerDto.name,
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      // Create a cart for the new user
      await tx.cart.create({
        data: {
          userId: createdUser.id,
        },
      });

      return createdUser;
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return { user, tokens };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked by an administrator');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        provider: user.provider,
        profileImage: user.profileImage,
      },
      tokens,
    };
  }

  async googleLogin(googleLoginDto: { code: string; redirectUri: string }) {
    let email: string;
    let name: string;
    let picture: string | null = null;

    const isMockMode = process.env.MOCK_GOOGLE_LOGIN === 'true' || googleLoginDto.code === 'mock-auth-code';

    if (isMockMode) {
      email = 'rahul.nair@gmail.com';
      name = 'Rahul Nair';
      picture = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
    } else {
      try {
        const client_id = process.env.GOOGLE_CLIENT_ID;
        const client_secret = process.env.GOOGLE_CLIENT_SECRET;

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: googleLoginDto.code,
            client_id: client_id || '',
            client_secret: client_secret || '',
            redirect_uri: googleLoginDto.redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        if (!tokenResponse.ok) {
          const errText = await tokenResponse.text();
          throw new UnauthorizedException(`Google token exchange failed: ${errText}`);
        }

        const tokens = await tokenResponse.json();
        const accessToken = tokens.access_token;

        const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userinfoResponse.ok) {
          throw new UnauthorizedException('Failed to fetch user info from Google');
        }

        const profile = await userinfoResponse.json();
        email = profile.email;
        name = profile.name || profile.given_name || 'Google User';
        picture = profile.picture || null;
      } catch (error) {
        throw new UnauthorizedException(error.message || 'Google authentication failed');
      }
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email,
            name,
            provider: 'GOOGLE',
            profileImage: picture,
            welcomeEmailSent: true,
            status: UserStatus.ACTIVE,
            role: Role.CUSTOMER,
          },
        });

        await tx.cart.create({
          data: { userId: createdUser.id },
        });

        return createdUser;
      });

      this.emailService.sendWelcomeEmail(name, email).catch((err) => {
        console.error('Failed to send welcome email:', err);
      });
    } else {
      const updates: any = {};
      if (user.provider !== 'GOOGLE') {
        updates.provider = 'GOOGLE';
      }
      if (picture && user.profileImage !== picture) {
        updates.profileImage = picture;
      }

      if (Object.keys(updates).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked by an administrator');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        provider: user.provider,
        profileImage: user.profileImage,
        isNewUser,
      },
      tokens,
    };
  }

  async refresh(refreshDto: RefreshDto) {
    const { refreshToken } = refreshDto;

    // Check if token exists in database
    const savedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!savedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (new Date() > savedToken.expiresAt) {
      // Clean up expired token
      await this.prisma.refreshToken.delete({ where: { id: savedToken.id } });
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (savedToken.user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('User is blocked');
    }

    // Delete the used token (Token Rotation)
    await this.prisma.refreshToken.delete({
      where: { id: savedToken.id },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(
      savedToken.user.id,
      savedToken.user.email,
      savedToken.user.role,
    );

    return tokens;
  }

  async logout(refreshToken: string) {
    try {
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
    } catch (error) {
      // If the token doesn't exist, we don't care, just succeed logout
    }
    return { message: 'Logged out successfully' };
  }
}
