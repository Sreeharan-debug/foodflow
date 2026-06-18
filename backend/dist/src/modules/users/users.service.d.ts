import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        firstName: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        provider: string;
        profileImage: string | null;
        mustChangePassword: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        firstName: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        provider: string;
        profileImage: string | null;
        mustChangePassword: boolean;
        createdAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, performedBy: string): Promise<{
        id: string;
        email: string;
        name: string;
        firstName: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        provider: string;
        profileImage: string | null;
        mustChangePassword: boolean;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findAddresses(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        label: string;
        houseNumber: string;
        buildingName: string | null;
        area: string;
        landmark: string | null;
        city: string;
        district: string;
        state: string;
        pincode: string;
    }[]>;
    createAddress(userId: string, createAddressDto: CreateAddressDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        label: string;
        houseNumber: string;
        buildingName: string | null;
        area: string;
        landmark: string | null;
        city: string;
        district: string;
        state: string;
        pincode: string;
    }>;
    updateAddress(userId: string, addressId: string, updateAddressDto: UpdateAddressDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        label: string;
        houseNumber: string;
        buildingName: string | null;
        area: string;
        landmark: string | null;
        city: string;
        district: string;
        state: string;
        pincode: string;
    }>;
    removeAddress(userId: string, addressId: string): Promise<{
        message: string;
    }>;
}
