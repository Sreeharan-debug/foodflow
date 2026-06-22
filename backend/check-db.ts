import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching active users and carts...');
  const users = await prisma.user.findMany({
    where: {
      role: 'CUSTOMER'
    },
    include: {
      cart: {
        include: {
          items: {
            include: {
              food: true
            }
          }
        }
      },
      addresses: true
    }
  });

  for (const user of users) {
    console.log(`User: ${user.name} (${user.email}) [ID: ${user.id}]`);
    console.log(`- Status: ${user.status}`);
    console.log(`- Addresses Count: ${user.addresses.length}`);
    for (const addr of user.addresses) {
      console.log(`  * Address: ${addr.id} - ${addr.label} (${addr.city})`);
    }
    
    if (user.cart) {
      console.log(`- Cart ID: ${user.cart.id}`);
      console.log(`- Cart Items Count: ${user.cart.items.length}`);
      for (const item of user.cart.items) {
        console.log(`  * Item: ${item.food.name} [ID: ${item.food.id}]`);
        console.log(`    Quantity: ${item.quantity}`);
        console.log(`    Price: ${item.food.price}`);
        console.log(`    Restaurant ID: ${item.food.restaurantId}`);
      }
    } else {
      console.log(`- No Cart found`);
    }
    console.log('--------------------------------------------------');
  }

  console.log('Coupons in database:');
  const coupons = await prisma.coupon.findMany();
  for (const coupon of coupons) {
    console.log(`- Coupon: ${coupon.code} (Discount: ${coupon.discount}, Active: ${coupon.isActive}, Expires: ${coupon.expiresAt})`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
