import { PrismaClient, Role, UserStatus, OrderStatus, AdminStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FOODFLOW ENTERPRISE MULTI-VENDOR database...');

  // 1. Clean up existing data
  await prisma.auditLog.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.food.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.user.deleteMany({});

  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);
  const customerPasswordHash = await bcrypt.hash('CustomerPassword123!', saltRounds);
  const superAdminPasswordHash = await bcrypt.hash('SuperAdminPassword123!', saltRounds);

  // 2. Create Super Admin User
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'owner@foodflow.com';
  const superAdmin = await prisma.user.create({
    data: {
      email: superAdminEmail,
      name: 'Super Administrator',
      password: superAdminPasswordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      mustChangePassword: false,
    },
  });
  console.log(`Seeded Super Admin: ${superAdminEmail}`);

  // Create empty cart for Super Admin
  await prisma.cart.create({ data: { userId: superAdmin.id } });

  // 3. Create Vendor Users & Restaurants
  // A. Malabar Kitchen (Approved)
  const vendorMalabarUser = await prisma.user.create({
    data: {
      email: 'admin@foodflow.com',
      name: 'Thalassery Chef',
      password: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  const restaurantMalabar = await prisma.restaurant.create({
    data: {
      name: 'Malabar Kitchen',
      ownerId: vendorMalabarUser.id,
      logo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=200',
      address: 'Kozhikode Beach Road, Calicut, Kerala - 673001',
      status: AdminStatus.APPROVED,
    },
  });

  // B. Punjab Grill (Approved)
  const vendorPunjabUser = await prisma.user.create({
    data: {
      email: 'vendor-north@foodflow.com',
      name: 'Harpreet Singh',
      password: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  const restaurantPunjab = await prisma.restaurant.create({
    data: {
      name: 'Punjab Grill',
      ownerId: vendorPunjabUser.id,
      logo: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=200',
      address: 'MG Road, Ernakulam, Kochi, Kerala - 682016',
      status: AdminStatus.APPROVED,
    },
  });

  // C. Chinatown Express (Pending)
  const vendorChineseUser = await prisma.user.create({
    data: {
      email: 'vendor-chinese@foodflow.com',
      name: 'Chen Wei',
      password: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  const restaurantChinatown = await prisma.restaurant.create({
    data: {
      name: 'Chinatown Express',
      ownerId: vendorChineseUser.id,
      logo: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=200',
      address: 'Panampilly Nagar, Kochi, Kerala - 682036',
      status: AdminStatus.PENDING,
    },
  });

  // D. Udipi Palace (Rejected)
  const vendorSouthUser = await prisma.user.create({
    data: {
      email: 'vendor-south@foodflow.com',
      name: 'Subramanian Iyer',
      password: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  const restaurantUdipi = await prisma.restaurant.create({
    data: {
      name: 'Udipi Palace',
      ownerId: vendorSouthUser.id,
      logo: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=200',
      address: 'Indiranagar, Bangalore, Karnataka - 560038',
      status: AdminStatus.REJECTED,
    },
  });

  // E. Arabian Nights (Suspended)
  const vendorArabianUser = await prisma.user.create({
    data: {
      email: 'vendor-arabian@foodflow.com',
      name: 'Yousef Al-Fahim',
      password: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  const restaurantArabian = await prisma.restaurant.create({
    data: {
      name: 'Arabian Nights',
      ownerId: vendorArabianUser.id,
      logo: 'https://images.unsplash.com/photo-1532636875304-0c8fe119aba9?auto=format&fit=crop&q=80&w=200',
      address: 'Kaloor Junction, Kochi, Kerala - 682017',
      status: AdminStatus.SUSPENDED,
    },
  });

  console.log('Seeded 5 Restaurants with different statuses.');

  // Create empty carts for vendor admins
  await prisma.cart.create({ data: { userId: vendorMalabarUser.id } });
  await prisma.cart.create({ data: { userId: vendorPunjabUser.id } });
  await prisma.cart.create({ data: { userId: vendorChineseUser.id } });
  await prisma.cart.create({ data: { userId: vendorSouthUser.id } });
  await prisma.cart.create({ data: { userId: vendorArabianUser.id } });

  // 4. Create Customers
  const customersData = [
    { email: 'customer@foodflow.com', name: 'Sreeharan Nair' },
    { email: 'arjun.mehta@gmail.com', name: 'Arjun Mehta' },
    { email: 'priya.sharma@yahoo.com', name: 'Priya Sharma' },
    { email: 'rahul.k@outlook.com', name: 'Rahul Krishnan' },
    { email: 'ananya.rao@gmail.com', name: 'Ananya Rao' },
    { email: 'vikram.singh@gmail.com', name: 'Vikram Singh' },
    { email: 'sneha.p@yahoo.com', name: 'Sneha Patel' },
    { email: 'karan.johry@gmail.com', name: 'Karan Johar' },
    { email: 'neha.gupta@outlook.com', name: 'Neha Gupta' },
    { email: 'rohit.sharma@gmail.com', name: 'Rohit Sharma' },
  ];

  const seededCustomers = [];
  for (const cust of customersData) {
    const createdCust = await prisma.user.create({
      data: {
        email: cust.email,
        name: cust.name,
        password: customerPasswordHash,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    });
    seededCustomers.push(createdCust);
    // Create cart
    await prisma.cart.create({ data: { userId: createdCust.id } });
  }
  console.log(`Seeded ${seededCustomers.length} Customers.`);

  // 5. Saved Addresses
  const cities = ['Kozhikode', 'Kochi', 'Trivandrum', 'Bangalore', 'Chennai', 'Hyderabad'];
  const districts = ['Kozhikode', 'Ernakulam', 'Trivandrum', 'Bengaluru Urban', 'Chennai', 'Hyderabad'];
  const states = ['Kerala', 'Kerala', 'Kerala', 'Karnataka', 'Tamil Nadu', 'Telangana'];

  const seededAddresses = [];
  for (let i = 0; i < seededCustomers.length; i++) {
    const cust = seededCustomers[i];
    const city = cities[i % cities.length];
    const district = districts[i % districts.length];
    const state = states[i % states.length];

    const addressHome = await prisma.address.create({
      data: {
        userId: cust.id,
        label: 'Home',
        houseNumber: `${10 + i}/A`,
        buildingName: 'Rose Garden Apartments',
        area: 'MG Road, Near Town Hall',
        landmark: 'Opposite Central Library',
        city,
        district,
        state,
        pincode: `67300${i + 1}`,
      },
    });
    seededAddresses.push(addressHome);

    if (i % 2 === 0) {
      const addressOffice = await prisma.address.create({
        data: {
          userId: cust.id,
          label: 'Office',
          houseNumber: `Plot ${45 + i}`,
          buildingName: 'Tech Park Block C',
          area: `Phase ${i + 1}, Industrial Zone`,
          landmark: 'Next to Metro Station',
          city,
          district,
          state,
          pincode: `67301${i + 1}`,
        },
      });
      seededAddresses.push(addressOffice);
    }
  }

  // 6. Categories (Can be owned by restaurants)
  const categoriesData = [
    { name: 'Biryanis', description: 'Fragrant long-grain basmati rice cooked with premium spices' },
    { name: 'South Indian', description: 'Crispy dosas, fluffy idlis, sambar' },
    { name: 'North Indian', description: 'Rich paneer curries, tandoori items' },
    { name: 'Indo-Chinese', description: 'Indo-Chinese hakka noodles, fried rice' },
    { name: 'Street Food', description: 'Tangy pani puris, vada pavs, pav bhajis' },
    { name: 'Breakfast', description: 'Morning traditional combos' },
    { name: 'Kerala Specials', description: 'Authentic Kerala nadan beef fry, porottas' },
    { name: 'Arabian', description: 'Grilled Al Faham chickens, shawarma wraps' },
    { name: 'Snacks', description: 'Hot samosas, banana fritters, tea-time snacks' },
    { name: 'Desserts', description: 'Gulab jamuns, warm payasam, faloodas' },
    { name: 'Beverages', description: 'Fresh mango lassis, mint juices, masala chai' },
  ];

  const categoriesMap: { [key: string]: string } = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: cat,
    });
    categoriesMap[cat.name] = createdCat.id;
  }

  // 7. Seed Foods (associated with active Approved/Suspended restaurants)
  const foodsData = [
    // ── Malabar Kitchen (Biryanis & Kerala Specials & Snacks & Desserts & Beverages)
    {
      name: 'Malabar Chicken Biryani',
      description: 'Authentic Thalassery biryani made with short-grain Kaima rice, ghee, soft chicken, and fried onions.',
      price: 249.00,
      imageUrl: '/images/foods/biryanis/malabar-biryani.jpg',
      rating: 4.9,
      preparationTime: 25,
      featured: true,
      isVeg: false,
      isBestseller: true,
      isTrending: true,
      categoryId: categoriesMap['Biryanis'],
      restaurantId: restaurantMalabar.id,
    },
    {
      name: 'Kerala Beef Fry (Nadan)',
      description: 'Slow-roasted beef chunks cooked with sliced coconuts, curry leaves, and fresh crushed spices.',
      price: 180.00,
      imageUrl: '/images/foods/kerala-specials/beef-fry.jpg',
      rating: 4.95,
      preparationTime: 20,
      featured: true,
      isVeg: false,
      isBestseller: true,
      isTrending: true,
      categoryId: categoriesMap['Kerala Specials'],
      restaurantId: restaurantMalabar.id,
    },
    {
      name: 'Kerala Porotta (Pack of 3)',
      description: 'Multi-layered, flaky, soft flatbread made with maida, kneaded and beaten to perfection.',
      price: 45.00,
      imageUrl: '/images/foods/kerala-specials/porotta.jpg',
      rating: 4.8,
      preparationTime: 12,
      featured: true,
      isVeg: true,
      isBestseller: true,
      categoryId: categoriesMap['Kerala Specials'],
      restaurantId: restaurantMalabar.id,
    },
    {
      name: 'Samosa (Pack of 2)',
      description: 'Crispy triangular pastry shells stuffed with seasoned potatoes, green peas, and mild spices.',
      price: 40.00,
      imageUrl: '/images/foods/snacks/samosa.jpg',
      rating: 4.6,
      preparationTime: 5,
      isVeg: true,
      isBestseller: true,
      categoryId: categoriesMap['Snacks'],
      restaurantId: restaurantMalabar.id,
    },
    {
      name: 'Sweet Mango Lassi',
      description: 'Creamy, rich yoghurt drink blended with ripe Alphonso mangoes and cardamom.',
      price: 80.00,
      imageUrl: '/images/foods/beverages/mango-lassi.jpg',
      rating: 4.85,
      preparationTime: 6,
      featured: true,
      isVeg: true,
      isBestseller: true,
      categoryId: categoriesMap['Beverages'],
      restaurantId: restaurantMalabar.id,
    },

    // ── Punjab Grill (North Indian)
    {
      name: 'Butter Chicken Masala',
      description: 'Tender tandoori chicken cooked in a rich, velvety, mildly sweet tomato-butter gravy with fresh cream.',
      price: 280.00,
      imageUrl: '/images/foods/north-indian/butter-chicken.jpg',
      rating: 4.9,
      preparationTime: 20,
      featured: true,
      isVeg: false,
      isBestseller: true,
      isTrending: true,
      categoryId: categoriesMap['North Indian'],
      restaurantId: restaurantPunjab.id,
    },
    {
      name: 'Paneer Butter Masala',
      description: 'Soft cottage cheese cubes simmered in a rich, creamy, spice-laden onion-tomato gravy.',
      price: 240.00,
      imageUrl: '/images/foods/north-indian/paneer-butter-masala.jpg',
      rating: 4.8,
      preparationTime: 18,
      featured: true,
      isVeg: true,
      isBestseller: true,
      categoryId: categoriesMap['North Indian'],
      restaurantId: restaurantPunjab.id,
    },
    {
      name: 'Chole Bhature Combo',
      description: 'Spicy chickpea curry served with two large, fluffy, deep-fried leavened flatbreads.',
      price: 150.00,
      imageUrl: '/images/foods/north-indian/chole-bhature.jpg',
      rating: 4.85,
      preparationTime: 15,
      featured: true,
      isVeg: true,
      isBestseller: true,
      isTrending: true,
      categoryId: categoriesMap['North Indian'],
      restaurantId: restaurantPunjab.id,
    },

    // ── Chinatown Express (Indo-Chinese) - Pending Approval (Hidden to customers but exists)
    {
      name: 'Veg Schezwan Fried Rice',
      description: 'Stir-fried rice tossed with colorful vegetables and spicy, tangy Schezwan red pepper sauce.',
      price: 160.00,
      imageUrl: '/images/foods/chinese/schezwan-fried-rice.jpg',
      rating: 4.6,
      preparationTime: 15,
      isVeg: true,
      categoryId: categoriesMap['Indo-Chinese'],
      restaurantId: restaurantChinatown.id,
    },
    {
      name: 'Chilli Chicken Dry',
      description: 'Crispy batter-fried chicken chunks tossed in spicy soy-chili sauce, green bell peppers, and spring onions.',
      price: 190.00,
      imageUrl: '/images/foods/chinese/chilli-chicken.jpg',
      rating: 4.8,
      preparationTime: 15,
      featured: true,
      isVeg: false,
      isBestseller: true,
      isTrending: true,
      categoryId: categoriesMap['Indo-Chinese'],
      restaurantId: restaurantChinatown.id,
    },

    // ── Udipi Palace (South Indian & Breakfast) - Rejected
    {
      name: 'Masala Dosa',
      description: 'Thin crispy crepe made of fermented rice batter, stuffed with spiced potato mash.',
      price: 110.00,
      imageUrl: '/images/foods/south-indian/masala-dosa.jpg',
      rating: 4.9,
      preparationTime: 12,
      featured: true,
      isVeg: true,
      isBestseller: true,
      isTrending: true,
      categoryId: categoriesMap['South Indian'],
      restaurantId: restaurantUdipi.id,
    },
    {
      name: 'Idli Sambar (2 Pieces)',
      description: 'Steamed fermented black lentils and rice cakes, served with piping hot vegetable sambar.',
      price: 60.00,
      imageUrl: '/images/foods/breakfast/idli-sambar.jpg',
      rating: 4.6,
      preparationTime: 10,
      isVeg: true,
      isBestseller: true,
      categoryId: categoriesMap['Breakfast'],
      restaurantId: restaurantUdipi.id,
    },

    // ── Arabian Nights (Arabian) - Suspended
    {
      name: 'Classic Chicken Shawarma',
      description: 'Shredded slow-grilled garlic chicken, french fries, and pickled cucumbers wrapped in rumali roti.',
      price: 120.00,
      imageUrl: '/images/foods/arabian/chicken-shawarma.jpg',
      rating: 4.8,
      preparationTime: 12,
      featured: true,
      isVeg: false,
      isBestseller: true,
      categoryId: categoriesMap['Arabian'],
      restaurantId: restaurantArabian.id,
    },
    {
      name: 'Al Faham Grilled Chicken',
      description: 'Arabian-style charcoal-grilled chicken marinated with middle-eastern spices.',
      price: 250.00,
      imageUrl: '/images/foods/arabian/al-faham.jpg',
      rating: 4.85,
      preparationTime: 20,
      isVeg: false,
      isBestseller: true,
      isTrending: true,
      categoryId: categoriesMap['Arabian'],
      restaurantId: restaurantArabian.id,
    }
  ];

  const seededFoods = [];
  for (const food of foodsData) {
    const createdFood = await prisma.food.create({
      data: food,
    });
    seededFoods.push(createdFood);
  }
  console.log(`Seeded ${seededFoods.length} multi-vendor Food Items.`);

  // 8. Coupons (some global, some restaurant-specific)
  const couponsData = [
    { code: 'WELCOME100', discount: 100.00, isActive: true, restaurantId: null },
    { code: 'FIRSTORDER', discount: 150.00, isActive: true, restaurantId: null },
    { code: 'MALABAR50', discount: 50.00, isActive: true, restaurantId: restaurantMalabar.id },
    { code: 'PUNJAB30', discount: 0.30, isActive: true, restaurantId: restaurantPunjab.id }, // 30% off
  ];

  const seededCoupons = [];
  for (const c of couponsData) {
    const createdCoupon = await prisma.coupon.create({
      data: {
        code: c.code,
        discount: c.discount,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: c.isActive,
        restaurantId: c.restaurantId,
      },
    });
    seededCoupons.push(createdCoupon);
  }
  console.log('Seeded multi-vendor coupons.');

  // 9. Seeding Orders (Tenant isolated - an order has items from ONLY one restaurant)
  const orderStatuses = [
    OrderStatus.DELIVERED,
    OrderStatus.DELIVERED,
    OrderStatus.DELIVERED,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.PENDING,
    OrderStatus.OUT_FOR_DELIVERY,
  ];

  // Let's seed 15 orders for Malabar Kitchen and 5 orders for Punjab Grill
  const malabarFoods = seededFoods.filter(f => f.restaurantId === restaurantMalabar.id);
  const punjabFoods = seededFoods.filter(f => f.restaurantId === restaurantPunjab.id);

  // Seed Malabar Kitchen Orders (15 orders)
  for (let i = 1; i <= 15; i++) {
    const customer = seededCustomers[i % seededCustomers.length];
    const customerAddress = seededAddresses.find(a => a.userId === customer.id) || seededAddresses[0];
    const status = orderStatuses[i % orderStatuses.length];

    const food1 = malabarFoods[i % malabarFoods.length];
    const food2 = malabarFoods[(i + 1) % malabarFoods.length];

    const price1 = parseFloat(food1.price.toString());
    const price2 = parseFloat(food2.price.toString());
    const subtotal = (price1 * 2) + price2;
    const tax = subtotal * 0.08;
    const discount = i % 3 === 0 ? 50.00 : 0.00;
    const total = Math.max(0, subtotal + tax - discount);

    const createdOrder = await prisma.order.create({
      data: {
        userId: customer.id,
        addressId: customerAddress.id,
        restaurantId: restaurantMalabar.id,
        total,
        tax,
        discount,
        couponId: i % 3 === 0 ? seededCoupons[2].id : null, // MALABAR50
        status,
        paymentStatus: status !== OrderStatus.PENDING ? 'PAID' : 'PENDING',
        createdAt: new Date(Date.now() - (i * 6 * 60 * 60 * 1000)), // dynamic hours ago
        items: {
          create: [
            { foodId: food1.id, price: food1.price, quantity: 2 },
            { foodId: food2.id, price: food2.price, quantity: 1 },
          ],
        },
      },
    });

    // Create payment success for confirmed/delivered orders
    if (status !== OrderStatus.PENDING) {
      const payId = `pay_mock_${createdOrder.id.substring(0, 8)}`;
      const ordId = `order_mock_${createdOrder.id.substring(0, 8)}`;
      await prisma.payment.create({
        data: {
          orderId: createdOrder.id,
          razorpayOrderId: ordId,
          razorpayPaymentId: payId,
          amount: total,
          status: 'SUCCESS',
          createdAt: createdOrder.createdAt,
        },
      });

      // Create Invoice
      await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${new Date().getFullYear()}-${1000 + i}`,
          orderId: createdOrder.id,
          customerId: customer.id,
          pdfUrl: `/public/invoices/invoice-mock-${createdOrder.id}.pdf`,
          createdAt: createdOrder.createdAt,
        },
      });
    }
  }

  // Seed Punjab Grill Orders (5 orders)
  for (let i = 1; i <= 5; i++) {
    const customer = seededCustomers[(i + 3) % seededCustomers.length];
    const customerAddress = seededAddresses.find(a => a.userId === customer.id) || seededAddresses[0];
    const status = orderStatuses[i % orderStatuses.length];

    const food1 = punjabFoods[i % punjabFoods.length];
    const food2 = punjabFoods[(i + 1) % punjabFoods.length];

    const price1 = parseFloat(food1.price.toString());
    const price2 = parseFloat(food2.price.toString());
    const subtotal = price1 + price2;
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const createdOrder = await prisma.order.create({
      data: {
        userId: customer.id,
        addressId: customerAddress.id,
        restaurantId: restaurantPunjab.id,
        total,
        tax,
        discount: 0,
        status,
        paymentStatus: status !== OrderStatus.PENDING ? 'PAID' : 'PENDING',
        createdAt: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)),
        items: {
          create: [
            { foodId: food1.id, price: food1.price, quantity: 1 },
            { foodId: food2.id, price: food2.price, quantity: 1 },
          ],
        },
      },
    });

    if (status !== OrderStatus.PENDING) {
      const payId = `pay_mock_punjab_${createdOrder.id.substring(0, 8)}`;
      const ordId = `order_mock_punjab_${createdOrder.id.substring(0, 8)}`;
      await prisma.payment.create({
        data: {
          orderId: createdOrder.id,
          razorpayOrderId: ordId,
          razorpayPaymentId: payId,
          amount: total,
          status: 'SUCCESS',
          createdAt: createdOrder.createdAt,
        },
      });

      // Create Invoice
      await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-PUNJ-${new Date().getFullYear()}-${1000 + i}`,
          orderId: createdOrder.id,
          customerId: customer.id,
          pdfUrl: `/public/invoices/invoice-mock-${createdOrder.id}.pdf`,
          createdAt: createdOrder.createdAt,
        },
      });
    }
  }

  console.log('Seeded 20 tenant-isolated orders and invoices.');

  // 10. Reviews
  const reviewsData = [
    {
      rating: 5,
      comment: "Absolutely outstanding Malabar biryani! The chicken is extremely tender.",
      userEmail: "customer@foodflow.com",
      foodName: "Malabar Chicken Biryani",
      restaurantId: restaurantMalabar.id,
    },
    {
      rating: 4,
      comment: "Very delicious and aromatic, but a bit too spicy for my taste.",
      userEmail: "arjun.mehta@gmail.com",
      foodName: "Malabar Chicken Biryani",
      restaurantId: restaurantMalabar.id,
    },
    {
      rating: 5,
      comment: "Classic Kerala taste! Highly recommend this nadan beef fry.",
      userEmail: "customer@foodflow.com",
      foodName: "Kerala Beef Fry (Nadan)",
      restaurantId: restaurantMalabar.id,
    },
    {
      rating: 5,
      comment: "Creamy, rich, and delicious! Goes perfectly with Butter Naan.",
      userEmail: "priya.sharma@yahoo.com",
      foodName: "Butter Chicken Masala",
      restaurantId: restaurantPunjab.id,
    }
  ];

  for (const rev of reviewsData) {
    const dbUser = seededCustomers.find(u => u.email === rev.userEmail);
    const dbFood = seededFoods.find(f => f.name === rev.foodName);
    if (dbUser && dbFood) {
      await prisma.review.create({
        data: {
          rating: rev.rating,
          comment: rev.comment,
          userId: dbUser.id,
          foodId: dbFood.id,
          restaurantId: rev.restaurantId,
        },
      });
    }
  }
  console.log('Seeded food & restaurant reviews.');

  // 11. Audit log
  await prisma.auditLog.create({
    data: {
      action: 'SEED_DATABASE_MULTI_VENDOR',
      performedBy: 'system',
      entityType: 'SYSTEM',
      entityId: '3.0',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
