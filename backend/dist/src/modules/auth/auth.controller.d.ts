import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    googleLogin(body: {
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
    logout(refreshDto: RefreshDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
