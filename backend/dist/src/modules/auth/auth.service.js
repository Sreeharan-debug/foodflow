"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const email_service_1 = require("../email/email.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    emailService;
    constructor(prisma, jwtService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async generateTokens(userId, email, role) {
        const payload = { email, sub: userId, role };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET || 'foodflow_jwt_access_secret_key_12345',
            expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m'),
        });
        const generateUniqueRefreshToken = async () => {
            const token = await this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET || 'foodflow_jwt_refresh_secret_key_12345',
                expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d'),
            });
            try {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);
                await this.prisma.refreshToken.create({
                    data: {
                        token,
                        userId,
                        expiresAt,
                    },
                });
                return token;
            }
            catch (e) {
                if (e?.code === 'P2002') {
                    const retryToken = await this.jwtService.signAsync(payload, {
                        secret: process.env.JWT_REFRESH_SECRET || 'foodflow_jwt_refresh_secret_key_12345',
                        expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d'),
                    });
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 7);
                    await this.prisma.refreshToken.create({
                        data: {
                            token: retryToken,
                            userId,
                            expiresAt,
                        },
                    });
                    return retryToken;
                }
                throw e;
            }
        };
        const refreshToken = await generateUniqueRefreshToken();
        return { accessToken, refreshToken };
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('A user with this email address already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                name: registerDto.name,
                firstName: registerDto.name.split(' ')[0] || registerDto.name,
                role: client_1.Role.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
            },
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });
        await this.prisma.cart.create({
            data: {
                userId: user.id,
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        this.emailService.sendWelcomeEmail(user.firstName || user.name.split(' ')[0] || 'Customer', user.email).catch((err) => {
            console.error('[Email Error] register welcome email failed:', err);
        });
        return { user, tokens };
    }
    async registerVendor(registerVendorDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerVendorDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('A user with this email address already exists');
        }
        const hashedPassword = await bcrypt.hash(registerVendorDto.password, 10);
        const createdUser = await this.prisma.user.create({
            data: {
                email: registerVendorDto.email,
                password: hashedPassword,
                name: registerVendorDto.name,
                firstName: registerVendorDto.name.split(' ')[0] || registerVendorDto.name,
                role: client_1.Role.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });
        await this.prisma.cart.create({
            data: {
                userId: createdUser.id,
            },
        });
        const restaurant = await this.prisma.restaurant.create({
            data: {
                name: registerVendorDto.restaurantName,
                ownerId: createdUser.id,
                address: registerVendorDto.address,
                logo: registerVendorDto.logo || '',
                status: client_1.AdminStatus.PENDING,
            },
        });
        const result = { user: createdUser, restaurant };
        const tokens = await this.generateTokens(result.user.id, result.user.email, result.user.role);
        this.emailService.sendWelcomeEmail(result.user.firstName || 'Vendor', result.user.email).catch((err) => {
            console.error('[Email Error] registerVendor welcome email failed:', err);
        });
        return {
            user: result.user,
            restaurant: result.restaurant,
            tokens,
        };
    }
    async login(loginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                },
            },
        });
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.status === client_1.UserStatus.BLOCKED) {
            throw new common_1.ForbiddenException('Your account has been blocked by an administrator');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                firstName: user.firstName,
                role: user.role,
                status: user.status,
                provider: user.provider,
                profileImage: user.profileImage,
                mustChangePassword: user.mustChangePassword,
                restaurant: user.restaurant,
            },
            tokens,
        };
    }
    async googleLogin(googleLoginDto) {
        let email;
        let name;
        let picture = null;
        let firstName = null;
        const client_id = process.env.GOOGLE_CLIENT_ID;
        const client_secret = process.env.GOOGLE_CLIENT_SECRET;
        if (!client_id || !client_secret) {
            throw new common_1.UnauthorizedException('Google OAuth credentials are not configured on the server.');
        }
        try {
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code: googleLoginDto.code,
                    client_id,
                    client_secret,
                    redirect_uri: googleLoginDto.redirectUri,
                    grant_type: 'authorization_code',
                }),
            });
            if (!tokenResponse.ok) {
                const errText = await tokenResponse.text();
                throw new common_1.UnauthorizedException(`Google token exchange failed: ${errText}`);
            }
            const tokens = await tokenResponse.json();
            const accessToken = tokens.access_token;
            const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!userinfoResponse.ok) {
                throw new common_1.UnauthorizedException('Failed to fetch user info from Google');
            }
            const profile = await userinfoResponse.json();
            email = profile.email;
            name = profile.name || profile.given_name || 'Google User';
            firstName = profile.given_name || name.split(' ')[0] || 'Google';
            picture = profile.picture || null;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(error.message || 'Google authentication failed');
        }
        if (!firstName) {
            firstName = name.split(' ')[0] || 'Google';
        }
        let user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                },
            },
        });
        let isNewUser = false;
        if (!user) {
            isNewUser = true;
            const createdUser = await this.prisma.user.create({
                data: {
                    email,
                    name,
                    firstName,
                    provider: 'google',
                    profileImage: picture,
                    welcomeEmailSent: true,
                    status: client_1.UserStatus.ACTIVE,
                    role: client_1.Role.CUSTOMER,
                },
            });
            await this.prisma.cart.create({
                data: { userId: createdUser.id },
            });
            user = { ...createdUser, restaurant: null };
            this.emailService.sendWelcomeEmail(firstName, email).catch((err) => {
                console.error('[Email Error] Google login welcome email failed:', err);
            });
        }
        else {
            const updates = {};
            if (user.provider !== 'google') {
                updates.provider = 'google';
            }
            if (picture && user.profileImage !== picture) {
                updates.profileImage = picture;
            }
            if (!user.firstName) {
                updates.firstName = firstName;
            }
            if (Object.keys(updates).length > 0) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: updates,
                    include: {
                        restaurant: {
                            select: {
                                id: true,
                                name: true,
                                status: true,
                            },
                        },
                    },
                });
            }
        }
        if (!user) {
            throw new common_1.UnauthorizedException('Google authentication failed: User profile not found');
        }
        if (user.status === client_1.UserStatus.BLOCKED) {
            throw new common_1.ForbiddenException('Your account has been blocked by an administrator');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                firstName: user.firstName,
                role: user.role,
                status: user.status,
                provider: user.provider,
                profileImage: user.profileImage,
                isNewUser,
                restaurant: user.restaurant,
            },
            tokens,
        };
    }
    async refresh(refreshDto) {
        const { refreshToken } = refreshDto;
        const savedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!savedToken) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        if (new Date() > savedToken.expiresAt) {
            await this.prisma.refreshToken.delete({ where: { id: savedToken.id } });
            throw new common_1.UnauthorizedException('Refresh token has expired');
        }
        if (savedToken.user.status === client_1.UserStatus.BLOCKED) {
            throw new common_1.ForbiddenException('User is blocked');
        }
        await this.prisma.refreshToken.delete({
            where: { id: savedToken.id },
        });
        const tokens = await this.generateTokens(savedToken.user.id, savedToken.user.email, savedToken.user.role);
        return tokens;
    }
    async logout(refreshToken) {
        try {
            await this.prisma.refreshToken.delete({
                where: { token: refreshToken },
            });
        }
        catch (error) {
        }
        return { message: 'Logged out successfully' };
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.password) {
            throw new common_1.BadRequestException('Invalid user account or cannot change password for social account');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Incorrect current password');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: false,
            },
        });
        return { message: 'Password changed successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map