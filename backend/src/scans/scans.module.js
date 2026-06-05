"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScansModule = void 0;
var common_1 = require("@nestjs/common");
var scanner_module_1 = require("../scanner/scanner.module");
var scans_controller_1 = require("./scans.controller");
var scans_service_1 = require("./scans.service");
var ScansModule = /** @class */ (function () {
    function ScansModule() {
    }
    ScansModule = __decorate([
        (0, common_1.Module)({
            imports: [scanner_module_1.ScannerModule],
            controllers: [scans_controller_1.ScansController],
            providers: [scans_service_1.ScansService],
        })
    ], ScansModule);
    return ScansModule;
}());
exports.ScansModule = ScansModule;
