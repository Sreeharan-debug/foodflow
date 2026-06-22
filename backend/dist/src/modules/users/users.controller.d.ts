import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMyAddresses(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        houseNumber: string;
        buildingName: string | null;
        area: string;
        landmark: string | null;
        city: string;
        district: string;
        state: string;
        pincode: string;
        userId: string;
    }[]>;
    createMyAddress(userId: string, createAddressDto: CreateAddressDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        houseNumber: string;
        buildingName: string | null;
        area: string;
        landmark: string | null;
        city: string;
        district: string;
        state: string;
        pincode: string;
        userId: string;
    }>;
    updateMyAddress(userId: string, addressId: string, updateAddressDto: UpdateAddressDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        houseNumber: string;
        buildingName: string | null;
        area: string;
        landmark: string | null;
        city: string;
        district: string;
        state: string;
        pincode: string;
        userId: string;
    }>;
    deleteMyAddress(userId: string, addressId: string): Promise<{
        message: string;
    }>;
    getAllUsers(): Promise<{
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
    getUserById(id: string): Promise<{
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
        restaurant: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.AdminStatus;
        } | null;
    }>;
    updateUser(id: string, updateUserDto: UpdateUserDto, adminEmail: string): Promise<{
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
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
