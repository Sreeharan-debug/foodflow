import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { EmailService } from '../email/email.service';
import { PaymentsService } from '../payments/payments.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;
  let wsGateway: WebsocketGateway;
  let paymentsService: PaymentsService;

  const mockPrismaService = {
    cart: {
      findUnique: jest.fn(),
    },
    address: {
      findFirst: jest.fn(),
    },
    coupon: {
      findUnique: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    cartItem: {
      deleteMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockWsGateway = {
    broadcastOrderCreated: jest.fn(),
    broadcastOrderUpdated: jest.fn(),
  };

  const mockEmailService = {
    sendOrderConfirmationEmail: jest.fn().mockResolvedValue(undefined),
  };

  const mockPaymentsService = {
    createRazorpayOrder: jest.fn(),
    verifyPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WebsocketGateway, useValue: mockWsGateway },
        { provide: EmailService, useValue: mockEmailService },
        { provide: PaymentsService, useValue: mockPaymentsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    wsGateway = module.get<WebsocketGateway>(WebsocketGateway);
    paymentsService = module.get<PaymentsService>(PaymentsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    const userId = 'user_id';
    const checkoutDto = {
      addressId: 'addr_id',
      couponCode: 'SAVE10',
    };

    it('should throw BadRequestException if cart is empty or not found', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(null);

      await expect(service.checkout(userId, checkoutDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if address is invalid', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue({
        items: [{ id: 'item_1', food: { price: 10 }, quantity: 1 }],
      });
      mockPrismaService.address.findFirst.mockResolvedValue(null);

      await expect(service.checkout(userId, checkoutDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if coupon is invalid', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue({
        items: [{ id: 'item_1', food: { price: 10 }, quantity: 1 }],
      });
      mockPrismaService.address.findFirst.mockResolvedValue({ id: 'addr_id' });
      mockPrismaService.coupon.findUnique.mockResolvedValue(null); // Invalid coupon

      await expect(service.checkout(userId, checkoutDto)).rejects.toThrow(BadRequestException);
    });

    it('should checkout successfully and trigger websocket broadcast', async () => {
      const cartObj = {
        id: 'cart_id',
        items: [
          {
            foodId: 'food_1',
            quantity: 2,
            food: { price: new Prisma.Decimal(12.50) },
          },
        ],
      };

      const addressObj = {
        id: 'addr_id',
        userId,
      };

      const couponObj = {
        id: 'coupon_id',
        code: 'SAVE10',
        discount: new Prisma.Decimal(0.10), // 10% off
        isActive: true,
        expiresAt: new Date(Date.now() + 100000),
      };

      const createdOrder = {
        id: 'order_id',
        userId,
        addressId: 'addr_id',
        total: 24.30, // 25 subtotal + 2.00 tax - 2.50 discount
        user: { email: 'customer@foodflow.com' },
        items: [],
      };

      mockPrismaService.cart.findUnique.mockResolvedValue(cartObj);
      mockPrismaService.address.findFirst.mockResolvedValue(addressObj);
      mockPrismaService.coupon.findUnique.mockResolvedValue(couponObj);
      mockPrismaService.order.create.mockResolvedValue(createdOrder);

      const result = await service.checkout(userId, checkoutDto);

      expect(result).toEqual({ order: createdOrder, razorpayOrder: undefined });
      expect(mockWsGateway.broadcastOrderCreated).toHaveBeenCalledWith(createdOrder);
      expect(mockPrismaService.cartItem.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all orders if role is ADMIN', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }]);

      const result = await service.findAll('user_id', Role.ADMIN);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.order.findMany).toHaveBeenCalled();
    });

    it('should return customer specific orders if role is CUSTOMER', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([{ id: '1' }]);

      const result = await service.findAll('user_id', Role.CUSTOMER);

      expect(result).toHaveLength(1);
    });
  });
});
