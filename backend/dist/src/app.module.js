"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const categories_module_1 = require("./modules/categories/categories.module");
const foods_module_1 = require("./modules/foods/foods.module");
const cart_module_1 = require("./modules/cart/cart.module");
const coupons_module_1 = require("./modules/coupons/coupons.module");
const orders_module_1 = require("./modules/orders/orders.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const audit_module_1 = require("./modules/audit/audit.module");
const websocket_module_1 = require("./modules/websocket/websocket.module");
const email_module_1 = require("./modules/email/email.module");
const payments_module_1 = require("./modules/payments/payments.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const super_admin_module_1 = require("./modules/super-admin/super-admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            categories_module_1.CategoriesModule,
            foods_module_1.FoodsModule,
            cart_module_1.CartModule,
            coupons_module_1.CouponsModule,
            orders_module_1.OrdersModule,
            dashboard_module_1.DashboardModule,
            audit_module_1.AuditModule,
            websocket_module_1.WebsocketModule,
            payments_module_1.PaymentsModule,
            reviews_module_1.ReviewsModule,
            super_admin_module_1.SuperAdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map