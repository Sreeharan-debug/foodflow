"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCouponDto = exports.CreateCouponDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCouponDto {
    code;
    discount;
    expiresAt;
    isActive;
}
exports.CreateCouponDto = CreateCouponDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Coupon code is required' }),
    __metadata("design:type", String)
], CreateCouponDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Discount must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Discount must be a positive value' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateCouponDto.prototype, "discount", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Please provide a valid expiration date' }),
    __metadata("design:type", String)
], CreateCouponDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateCouponDto.prototype, "isActive", void 0);
class UpdateCouponDto {
    code;
    discount;
    expiresAt;
    isActive;
}
exports.UpdateCouponDto = UpdateCouponDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCouponDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Discount must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Discount must be a positive value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateCouponDto.prototype, "discount", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Please provide a valid expiration date' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCouponDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], UpdateCouponDto.prototype, "isActive", void 0);
//# sourceMappingURL=coupon.dto.js.map