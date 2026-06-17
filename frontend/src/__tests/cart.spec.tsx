import { describe, it, expect } from 'vitest';
import * as z from 'zod';

// Form validation schemas under test
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Cart calculation logic under test
interface Food {
  price: string;
}
interface CartItem {
  quantity: number;
  food: Food;
}
interface Coupon {
  discount: string;
}

function calculateCart({ items, coupon }: { items: CartItem[]; coupon: Coupon | null }) {
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.food.price) * item.quantity, 0);
  const tax = subtotal * 0.08;
  
  let discount = 0;
  if (coupon) {
    const couponDiscount = parseFloat(coupon.discount);
    if (couponDiscount <= 1.0) {
      discount = subtotal * couponDiscount;
    } else {
      discount = couponDiscount;
    }
    if (discount > subtotal) discount = subtotal;
  }

  const total = Math.max(0, subtotal + tax - discount);
  return { subtotal, tax, discount, total };
}

describe('Frontend Form Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct email and password', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: 'Password123!' });
      expect(result.success).toBe(true);
    });

    it('should fail on invalid email format', () => {
      const result = loginSchema.safeParse({ email: 'test', password: 'Password123!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email address');
      }
    });

    it('should fail on too short password', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: '123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 6 characters');
      }
    });
  });

  describe('registerSchema', () => {
    it('should fail if name is too short', () => {
      const result = registerSchema.safeParse({ name: 'a', email: 'test@example.com', password: 'Password123!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name must be at least 2 characters');
      }
    });
  });
});

describe('Frontend Cart Calculation Logic', () => {
  it('should calculate correct subtotal and tax with no coupon', () => {
    const items = [
      { quantity: 2, food: { price: '12.50' } }, // 25.00
      { quantity: 1, food: { price: '5.00' } },  // 5.00
    ];
    const { subtotal, tax, discount, total } = calculateCart({ items, coupon: null });
    
    expect(subtotal).toBe(30);
    expect(tax).toBeCloseTo(2.4); // 30 * 0.08
    expect(discount).toBe(0);
    expect(total).toBeCloseTo(32.4);
  });

  it('should calculate correct discount with percentage coupon (<= 1.0)', () => {
    const items = [{ quantity: 2, food: { price: '50.00' } }]; // 100.00
    const coupon = { discount: '0.15' }; // 15% off
    const { subtotal, tax, discount, total } = calculateCart({ items, coupon });

    expect(subtotal).toBe(100);
    expect(tax).toBe(8); // 8.00
    expect(discount).toBe(15); // 15% of 100
    expect(total).toBeCloseTo(93); // 100 + 8 - 15
  });

  it('should calculate correct discount with flat coupon (> 1.0)', () => {
    const items = [{ quantity: 1, food: { price: '40.00' } }]; // 40.00
    const coupon = { discount: '15.00' }; // $15 off
    const { subtotal, tax, discount, total } = calculateCart({ items, coupon });

    expect(subtotal).toBe(40);
    expect(tax).toBeCloseTo(3.2); // 3.20
    expect(discount).toBe(15);
    expect(total).toBeCloseTo(28.2); // 40 + 3.20 - 15
  });

  it('should cap the discount at subtotal amount', () => {
    const items = [{ quantity: 1, food: { price: '10.00' } }];
    const coupon = { discount: '20.00' }; // Flat $20 off on a $10 item
    const { subtotal, discount, total } = calculateCart({ items, coupon });

    expect(subtotal).toBe(10);
    expect(discount).toBe(10); // capped at subtotal
    expect(total).toBeCloseTo(0.8); // subtotal (10) + tax (0.80) - discount (10)
  });
});
