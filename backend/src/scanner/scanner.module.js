"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScannerModule = void 0;
var common_1 = require("@nestjs/common");
var scanner_service_1 = require("./scanner.service");
var ScannerModule = /** @class */ (function () {
    function ScannerModule() {
    }
    ScannerModule = __decorate([
        (0, common_1.Module)({
            providers: [scanner_service_1.ScannerService],
            exports: [scanner_service_1.ScannerService],
        })
    ], ScannerModule);
    return ScannerModule;
}());
exports.ScannerModule = ScannerModule;
