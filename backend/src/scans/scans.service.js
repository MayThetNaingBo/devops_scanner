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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScansService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var prisma_service_1 = require("../prisma/prisma.service");
var scanner_service_1 = require("../scanner/scanner.service");
var ScansService = /** @class */ (function () {
    function ScansService(prisma, scannerService) {
        this.prisma = prisma;
        this.scannerService = scannerService;
    }
    ScansService.prototype.createScan = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var repoInfo, repository, scanJob, result, report, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repoInfo = this.extractGitHubRepoInfo(dto.repoUrl);
                        return [4 /*yield*/, this.prisma.repository.create({
                                data: {
                                    repoUrl: dto.repoUrl,
                                    repoName: repoInfo.repoName,
                                    ownerName: repoInfo.ownerName,
                                },
                            })];
                    case 1:
                        repository = _a.sent();
                        return [4 /*yield*/, this.prisma.scanJob.create({
                                data: {
                                    repositoryId: repository.id,
                                    status: client_1.ScanStatus.RUNNING,
                                    startedAt: new Date(),
                                },
                                include: {
                                    repository: true,
                                },
                            })];
                    case 2:
                        scanJob = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 7, , 9]);
                        return [4 /*yield*/, this.scannerService.scanRepository(dto.repoUrl)];
                    case 4:
                        result = _a.sent();
                        return [4 /*yield*/, this.prisma.scanReport.create({
                                data: {
                                    scanJobId: scanJob.id,
                                    overallScore: result.scores.overallScore,
                                    securityScore: result.scores.securityScore,
                                    readmeScore: result.scores.readmeScore,
                                    envScore: result.scores.envScore,
                                    deploymentScore: result.scores.deploymentScore,
                                    codeStructureScore: result.scores.codeStructureScore,
                                    summary: result.summary,
                                    findings: {
                                        create: result.findings.map(function (finding) { return ({
                                            category: finding.category,
                                            severity: finding.severity,
                                            title: finding.title,
                                            description: finding.description,
                                            filePath: finding.filePath,
                                            lineNumber: finding.lineNumber,
                                            suggestion: finding.suggestion,
                                        }); }),
                                    },
                                },
                                include: {
                                    findings: {
                                        orderBy: {
                                            createdAt: 'asc',
                                        },
                                    },
                                },
                            })];
                    case 5:
                        report = _a.sent();
                        return [4 /*yield*/, this.prisma.scanJob.update({
                                where: {
                                    id: scanJob.id,
                                },
                                data: {
                                    status: client_1.ScanStatus.COMPLETED,
                                    completedAt: new Date(),
                                },
                            })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, {
                                scanJobId: scanJob.id,
                                repository: repository,
                                report: report,
                            }];
                    case 7:
                        error_1 = _a.sent();
                        return [4 /*yield*/, this.prisma.scanJob.update({
                                where: {
                                    id: scanJob.id,
                                },
                                data: {
                                    status: client_1.ScanStatus.FAILED,
                                    errorMessage: error_1 instanceof Error ? error_1.message : 'Unknown scan error',
                                    completedAt: new Date(),
                                },
                            })];
                    case 8:
                        _a.sent();
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    ScansService.prototype.getAllScans = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.prisma.scanJob.findMany({
                        orderBy: {
                            createdAt: 'desc',
                        },
                        include: {
                            repository: true,
                            report: {
                                include: {
                                    findings: true,
                                },
                            },
                        },
                    })];
            });
        });
    };
    ScansService.prototype.getScanById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var scan;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.scanJob.findUnique({
                            where: {
                                id: id,
                            },
                            include: {
                                repository: true,
                                report: {
                                    include: {
                                        findings: {
                                            orderBy: {
                                                severity: 'desc',
                                            },
                                        },
                                    },
                                },
                            },
                        })];
                    case 1:
                        scan = _a.sent();
                        if (!scan) {
                            throw new common_1.NotFoundException('Scan not found');
                        }
                        return [2 /*return*/, scan];
                }
            });
        });
    };
    ScansService.prototype.extractGitHubRepoInfo = function (repoUrl) {
        var cleaned = repoUrl.replace(/\/$/, '');
        var parts = cleaned.split('/');
        return {
            ownerName: parts[parts.length - 2],
            repoName: parts[parts.length - 1],
        };
    };
    ScansService = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [prisma_service_1.PrismaService,
            scanner_service_1.ScannerService])
    ], ScansService);
    return ScansService;
}());
exports.ScansService = ScansService;
