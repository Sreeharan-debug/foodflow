import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        role: true,
        status: true,
        provider: true,
        profileImage: true,
        mustChangePassword: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        role: true,
        status: true,
        provider: true,
        profileImage: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, performedBy: string) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        role: true,
        status: true,
        provider: true,
        profileImage: true,
        mustChangePassword: true,
      },
    });

    // Write audit log if user status is updated
    if (updateUserDto.status && updateUserDto.status !== user.status) {
      await this.prisma.auditLog.create({
        data: {
          action: updateUserDto.status === 'BLOCKED' ? 'BLOCK_USER' : 'UNBLOCK_USER',
          performedBy,
          entityType: 'USER',
          entityId: id,
        },
      });
    }

    return updatedUser;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  // Address CRUD
  async findAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createAddress(userId: string, createAddressDto: CreateAddressDto) {
    return this.prisma.address.create({
      data: {
        userId,
        ...createAddressDto,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException(`Address not found`);
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: updateAddressDto,
    });
  }

  async removeAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException(`Address not found`);
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return { message: 'Address removed successfully' };
  }
}
