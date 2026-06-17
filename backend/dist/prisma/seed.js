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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding FOODFLOW INDIA 3.0 database...');
    await prisma.auditLog.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.coupon.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.food.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', saltRounds);
    const customerPasswordHash = await bcrypt.hash('CustomerPassword123!', saltRounds);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@foodflow.com',
            name: 'System Admin',
            password: adminPasswordHash,
            role: client_1.Role.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
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
                role: client_1.Role.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        seededCustomers.push(createdCust);
    }
    console.log(`Seeded 1 Admin and ${seededCustomers.length} Customer Accounts.`);
    await prisma.cart.create({ data: { userId: admin.id } });
    for (const cust of seededCustomers) {
        await prisma.cart.create({ data: { userId: cust.id } });
    }
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
    console.log(`Seeded ${seededAddresses.length} saved addresses.`);
    const categoriesData = [
        { name: 'Biryanis', description: 'Fragrant long-grain basmati rice cooked with premium spices and meat/veggies' },
        { name: 'South Indian', description: 'Crispy dosas, fluffy idlis, sambar, and fresh coconut chutneys' },
        { name: 'North Indian', description: 'Rich paneer curries, tandoori items, and butter naan flatbreads' },
        { name: 'Chinese', description: 'Indo-Chinese hakka noodles, fried rice, and spicy manchurian' },
        { name: 'Street Food', description: 'Tangy pani puris, vada pavs, pav bhajis, and chat items' },
        { name: 'Breakfast', description: 'Standard morning snacks, puttu, appam, and traditional combos' },
        { name: 'Kerala Specials', description: 'Authentic Kerala nadan beef fry, porottas, and fish curries' },
        { name: 'Arabian', description: 'Grilled Al Faham chickens, shawarma wraps, and mandi rice bowls' },
        { name: 'Snacks', description: 'Hot samosas, banana fritters, cutlets, and tea-time snacks' },
        { name: 'Desserts', description: 'Gulab jamuns, warm payasam, faloodas, and sweet treats' },
        { name: 'Beverages', description: 'Fresh mango lassis, mint juices, and hot masala chai' },
    ];
    const categoriesMap = {};
    for (const cat of categoriesData) {
        const createdCat = await prisma.category.create({
            data: cat,
        });
        categoriesMap[cat.name] = createdCat.id;
    }
    console.log('Categories / Cuisines seeded.');
    const foodsData = [
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
            isNew: false,
            spiceLevel: 'Medium',
            categoryId: categoriesMap['Biryanis'],
        },
        {
            name: 'Hyderabadi Veg Biryani',
            description: 'Slow-cooked Basmati rice layered with fresh vegetables, mint, saffron, and aromatic spices.',
            price: 199.00,
            imageUrl: '/images/foods/biryanis/veg-biryani.jpg',
            rating: 4.7,
            preparationTime: 20,
            featured: false,
            isVeg: true,
            isBestseller: false,
            isTrending: true,
            isNew: false,
            spiceLevel: 'Hot',
            categoryId: categoriesMap['Biryanis'],
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
            isNew: false,
            spiceLevel: 'Extra Hot',
            categoryId: categoriesMap['Kerala Specials'],
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
            isTrending: false,
            isNew: false,
            spiceLevel: 'Mild',
            categoryId: categoriesMap['Kerala Specials'],
        },
        {
            name: 'Chicken Kothu Porotta',
            description: 'Shredded Kerala porotta stir-fried with eggs, tender chicken pieces, onions, and spicy salna.',
            price: 160.00,
            imageUrl: '/images/foods/kerala-specials/kothu-porotta.jpg',
            rating: 4.7,
            preparationTime: 15,
            featured: false,
            isVeg: false,
            isBestseller: false,
            isTrending: true,
            isNew: false,
            spiceLevel: 'Hot',
            categoryId: categoriesMap['Kerala Specials'],
        },
        {
            name: 'Nadan Fish Curry Meals',
            description: 'Traditional Kerala rice served with spicy coconut fish curry, stir-fried cabbage, pickle, and moru.',
            price: 220.00,
            imageUrl: '/images/foods/kerala-specials/fish-curry-meals.jpg',
            rating: 4.85,
            preparationTime: 22,
            featured: true,
            isVeg: false,
            isBestseller: true,
            isTrending: false,
            isNew: false,
            spiceLevel: 'Hot',
            categoryId: categoriesMap['Kerala Specials'],
        },
        {
            name: 'Puttu and Kadala Curry',
            description: 'Steamed ground rice and coconut cylinders served with flavorful black chickpea gravy.',
            price: 90.00,
            imageUrl: '/images/foods/breakfast/puttu-kadala.jpg',
            rating: 4.75,
            preparationTime: 15,
            featured: false,
            isVeg: true,
            isBestseller: true,
            isTrending: false,
            isNew: false,
            spiceLevel: null,
            categoryId: categoriesMap['Breakfast'],
        },
        {
            name: 'Appam with Veg Stew',
            description: 'Soft, lacy rice pancakes with spongy centers served with mild coconut milk vegetable stew.',
            price: 110.00,
            imageUrl: '/images/foods/breakfast/appam-stew.jpg',
            rating: 4.8,
            preparationTime: 15,
            featured: false,
            isVeg: true,
            isBestseller: false,
            isTrending: false,
            isNew: true,
            spiceLevel: null,
            categoryId: categoriesMap['Breakfast'],
        },
        {
            name: 'Idli Sambar (2 Pieces)',
            description: 'Steamed fermented black lentils and rice cakes, served with piping hot vegetable sambar and coconut chutney.',
            price: 60.00,
            imageUrl: '/images/foods/breakfast/idli-sambar.jpg',
            rating: 4.6,
            preparationTime: 10,
            featured: false,
            isVeg: true,
            isBestseller: true,
            isTrending: false,
            isNew: false,
            spiceLevel: null,
            categoryId: categoriesMap['Breakfast'],
        },
        {
            name: 'Masala Dosa',
            description: 'Thin crispy crepe made of fermented rice batter, stuffed with spiced potato mash. Served with chutneys.',
            price: 110.00,
            imageUrl: '/images/foods/south-indian/masala-dosa.jpg',
            rating: 4.9,
            preparationTime: 12,
            featured: true,
            isVeg: true,
            isBestseller: true,
            isTrending: true,
            isNew: false,
            spiceLevel: 'Medium',
            categoryId: categoriesMap['South Indian'],
        },
        {
            name: 'Ghee Roast Dosa',
            description: 'Paper-thin, golden crispy rice crepe roasted with premium cow ghee.',
            price: 130.00,
            imageUrl: '/images/foods/south-indian/ghee-roast-dosa.jpg',
            rating: 4.75,
            preparationTime: 10,
            featured: false,
            isVeg: true,
            isBestseller: false,
            isTrending: false,
            isNew: true,
            spiceLevel: 'Mild',
            categoryId: categoriesMap['South Indian'],
        },
        {
            name: 'Medu Vada (Pack of 2)',
            description: 'Crispy, deep-fried doughnut shaped fritters made of urad dal batter. Served with sambar.',
            price: 50.00,
            imageUrl: '/images/foods/south-indian/medu-vada.jpg',
            rating: 4.5,
            preparationTime: 8,
            featured: false,
            isVeg: true,
            isBestseller: false,
            isTrending: false,
            isNew: false,
            spiceLevel: 'Mild',
            categoryId: categoriesMap['South Indian'],
        },
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
            isNew: false,
            spiceLevel: 'Medium',
            categoryId: categoriesMap['North Indian'],
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
            isTrending: false,
            isNew: false,
            spiceLevel: 'Medium',
            categoryId: categoriesMap['North Indian'],
        },
        {
            name: 'Tandoori Chicken (Half)',
            description: 'Chicken marinated in yogurt and Indian spices, roasted to a smoky finish in a clay tandoor oven.',
            price: 260.00,
            imageUrl: '/images/foods/north-indian/tandoori-chicken.jpg',
            rating: 4.75,
            preparationTime: 22,
            featured: false,
            isVeg: false,
            isBestseller: false,
            isTrending: true,
            isNew: false,
            spiceLevel: 'Hot',
            categoryId: categoriesMap['North Indian'],
        },
        {
            name: 'Chole Bhature Combo',
            description: 'Spicy chickpea curry served with two large, fluffy, deep-fried leavened flatbreads and pickle.',
            price: 150.00,
            imageUrl: '/images/foods/north-indian/chole-bhature.jpg',
            rating: 4.85,
            preparationTime: 15,
            featured: true,
            isVeg: true,
            isBestseller: true,
            isTrending: true,
            isNew: false,
            spiceLevel: 'Hot',
            categoryId: categoriesMap['North Indian'],
        },
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
            isTrending: false,
            isNew: false,
            spiceLevel: 'Medium',
            categoryId: categoriesMap['Arabian'],
        },
        {
            name: 'Al Faham Grilled Chicken',
            description: 'Arabian-style charcoal-grilled chicken marinated with middle-eastern spices. Served with garlic paste.',
            price: 250.00,
            imageUrl: '/images/foods/arabian/al-faham.jpg',
            rating: 4.85,
            preparationTime: 20,
            featured: false,
            isVeg: false,
            isBestseller: true,
            isTrending: true,
            isNew: false,
            spiceLevel: 'Medium',
            categoryId: categoriesMap['Arabian'],
        },
        {
            name: 'Kuzhimanthi Chicken Rice',
            description: 'Fragrant basmati rice cooked in an underground pit, served with soft chicken and tomato chutney.',
            price: 270.00,
            imageUrl: '/images/foods/arabian/kuzhimanthi.jpg',
            rating: 4.9,
            preparationTime: 20,
            featured: true,
            isVeg: false,
            isBestseller: true,
            isTrending: true,
            isNew: false,
            spiceLevel: 'Medium',
            categoryId: categoriesMap['Arabian'],
        },
        {
            name: 'Pav Bhaji',
            description: 'Thick spicy vegetable mash topped with butter, served with two toasted soft pav bread rolls.',
            price: 120.00,
            imageUrl: '/images/foods/street-food/pav-bhaji.jpg',
            rating: 4.7,
            preparationTime: 12,
            featured: false,
            isVeg: true,
            isBestseller: true,
            isTrending: false,
            isNew: false,
            spiceLevel: 'Medium',
            categoryId: categoriesMap['Street Food'],
        },
        {
            name: 'Vada Pav (2 Pieces)',
            description: 'The ultimate Mumbai street food. Deep-fried potato dumpling placed inside a soft bread bun with chutneys.',
            price: 70.00,
            imageUrl: '/images/foods/street-food/vada-pav.jpg',
            rating: 4.8,
            preparationTime: 8,
            featured: false,
            isVeg: true,
            isBestseller: true,
            isTrending: false,
            isNew: false,
            spiceLevel: 'Hot',
            categoryId: categoriesMap['Street Food'],
        },
        {
            name: 'Pani Puri (10 Pieces)',
            description: 'Crispy hollow puris filled with potatoes, chickpeas, tamarind water, and spicy mint water.',
            price: 80.00,
            imageUrl: '/images/foods/street-food/pani-puri.jpg',
            rating: 4.9,
            preparationTime: 10,
            featured: true,
            isVeg: true,
            isBestseller: false,
            isTrending: true,
            isNew: false,
            spiceLevel: 'Hot',
            categoryId: categoriesMap['Street Food'],
        },
        {
            name: 'Veg Schezwan Fried Rice',
            description: 'Stir-fried rice tossed with colorful vegetables and spicy, tangy Schezwan red pepper sauce.',
            price: 160.00,
            imageUrl: '/images/foods/chinese/schezwan-fried-rice.jpg',
            rating: 4.6,
            preparationTime: 15,
            featured: false,
            isVeg: true,
            isBestseller: false,
            isTrending: false,
            isNew: false,
            spiceLevel: 'Hot',
            categoryId: categoriesMap['Chinese'],
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
            isNew: false,
            spiceLevel: 'Hot',
            categoryId: categoriesMap['Chinese'],
        },
        {
            name: 'Samosa (Pack of 2)',
            description: 'Crispy triangular pastry shells stuffed with seasoned potatoes, green peas, and mild spices.',
            price: 40.00,
            imageUrl: '/images/foods/snacks/samosa.jpg',
            rating: 4.6,
            preparationTime: 5,
            featured: false,
            isVeg: true,
            isBestseller: true,
            isTrending: false,
            isNew: false,
            spiceLevel: 'Medium',
            categoryId: categoriesMap['Snacks'],
        },
        {
            name: 'Kerala Pazham Pori (3 Pieces)',
            description: 'Ripe plantain slices dipped in a sweet flour batter and deep-fried to a golden crispy finish.',
            price: 40.00,
            imageUrl: '/images/foods/snacks/pazham-pori.jpg',
            rating: 4.8,
            preparationTime: 8,
            featured: false,
            isVeg: true,
            isBestseller: true,
            isTrending: true,
            isNew: false,
            spiceLevel: 'Mild',
            categoryId: categoriesMap['Snacks'],
        },
        {
            name: 'Gulab Jamun (2 Pieces)',
            description: 'Soft, spongy berry-sized milk solids soaked in cardamom flavored warm sugar syrup.',
            price: 60.00,
            imageUrl: '/images/foods/desserts/gulab-jamun.jpg',
            rating: 4.9,
            preparationTime: 5,
            featured: true,
            isVeg: true,
            isBestseller: true,
            isTrending: false,
            isNew: false,
            spiceLevel: null,
            categoryId: categoriesMap['Desserts'],
        },
        {
            name: 'Creamy Rasmalai (2 Pieces)',
            description: 'Flattened cottage cheese patties soaked in thickened, saffron-infused sweet milk. Served cold.',
            price: 80.00,
            imageUrl: '/images/foods/desserts/rasmalai.jpg',
            rating: 4.85,
            preparationTime: 5,
            featured: false,
            isVeg: true,
            isBestseller: false,
            isTrending: true,
            isNew: false,
            spiceLevel: null,
            categoryId: categoriesMap['Desserts'],
        },
        {
            name: 'Royal Falooda',
            description: 'Refreshing dessert drink with vermicelli, sweet basil seeds, rose syrup, cold milk, and vanilla ice cream.',
            price: 140.00,
            imageUrl: '/images/foods/desserts/falooda.jpg',
            rating: 4.9,
            preparationTime: 8,
            featured: true,
            isVeg: true,
            isBestseller: true,
            isTrending: true,
            isNew: false,
            spiceLevel: null,
            categoryId: categoriesMap['Desserts'],
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
            isTrending: false,
            isNew: false,
            spiceLevel: null,
            categoryId: categoriesMap['Beverages'],
        },
        {
            name: 'Fresh Mint Lime Cooler',
            description: 'Refreshing cold lime juice squeezed with fresh mint, ginger, and soda water.',
            price: 50.00,
            imageUrl: '/images/foods/beverages/mint-lime-cooler.jpg',
            rating: 4.6,
            preparationTime: 5,
            featured: false,
            isVeg: true,
            isBestseller: false,
            isTrending: false,
            isNew: false,
            spiceLevel: null,
            categoryId: categoriesMap['Beverages'],
        },
        {
            name: 'Nadan Masala Chai',
            description: 'Traditional Indian tea brewed with cardamom, ginger, cloves, and milk.',
            price: 30.00,
            imageUrl: '/images/foods/beverages/masala-chai.jpg',
            rating: 4.9,
            preparationTime: 7,
            featured: true,
            isVeg: true,
            isBestseller: true,
            isTrending: false,
            isNew: false,
            spiceLevel: null,
            categoryId: categoriesMap['Beverages'],
        },
    ];
    const seededFoods = [];
    for (const food of foodsData) {
        const createdFood = await prisma.food.create({
            data: food,
        });
        seededFoods.push(createdFood);
    }
    console.log(`Seeded ${seededFoods.length} Indian food items.`);
    const couponsData = [
        { code: 'WELCOME100', discount: 100.00, isActive: true },
        { code: 'BIRYANI50', discount: 50.00, isActive: true },
        { code: 'FIRSTORDER', discount: 150.00, isActive: true },
        { code: 'KERALA20', discount: 0.20, isActive: true },
        { code: 'FOODFLOW100', discount: 100.00, isActive: true },
    ];
    const seededCoupons = [];
    for (const c of couponsData) {
        const createdCoupon = await prisma.coupon.create({
            data: {
                code: c.code,
                discount: c.discount,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: c.isActive,
            },
        });
        seededCoupons.push(createdCoupon);
    }
    console.log('Coupons seeded.');
    const orderStatuses = [
        client_1.OrderStatus.DELIVERED,
        client_1.OrderStatus.DELIVERED,
        client_1.OrderStatus.DELIVERED,
        client_1.OrderStatus.CONFIRMED,
        client_1.OrderStatus.PREPARING,
        client_1.OrderStatus.PENDING,
        client_1.OrderStatus.OUT_FOR_DELIVERY,
    ];
    for (let i = 1; i <= 20; i++) {
        const custIndex = i % seededCustomers.length;
        const customer = seededCustomers[custIndex];
        const customerAddress = seededAddresses.find(a => a.userId === customer.id) || seededAddresses[0];
        const status = orderStatuses[i % orderStatuses.length];
        const food1 = seededFoods[(i * 3) % seededFoods.length];
        const food2 = seededFoods[(i * 7) % seededFoods.length];
        const price1 = parseFloat(food1.price.toString());
        const price2 = parseFloat(food2.price.toString());
        const subtotal = (price1 * 2) + price2;
        const tax = subtotal * 0.08;
        const discount = i % 4 === 0 ? 50.00 : 0.00;
        const total = Math.max(0, subtotal + tax - discount);
        await prisma.order.create({
            data: {
                userId: customer.id,
                addressId: customerAddress.id,
                total,
                tax,
                discount,
                couponId: i % 4 === 0 ? seededCoupons[1].id : null,
                status,
                createdAt: new Date(Date.now() - (i * 4 * 60 * 60 * 1000)),
                items: {
                    create: [
                        {
                            foodId: food1.id,
                            price: food1.price,
                            quantity: 2,
                        },
                        {
                            foodId: food2.id,
                            price: food2.price,
                            quantity: 1,
                        },
                    ],
                },
            },
        });
    }
    console.log('20 Sample orders in INR seeded successfully.');
    await prisma.auditLog.create({
        data: {
            action: 'SEED_DATABASE_INDIA_3.3',
            performedBy: 'system',
            entityType: 'SYSTEM',
            entityId: '3.3',
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
//# sourceMappingURL=seed.js.map