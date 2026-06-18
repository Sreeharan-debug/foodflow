import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Role } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, emailService: EmailService);
    generateTokens(userId: string, email: string, role: Role): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            firstName: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
            createdAt: Date;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            firstName: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: "ACTIVE";
            provider: string;
            profileImage: string | null;
            mustChangePassword: boolean;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    googleLogin(googleLoginDto: {
        code: string;
        redirectUri: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            firstName: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: "ACTIVE";
            provider: string;
            profileImage: string | null;
            isNewUser: boolean;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    refresh(refreshDto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
