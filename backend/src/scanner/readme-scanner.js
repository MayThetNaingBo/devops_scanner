"use strict";
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
exports.scanReadme = scanReadme;
var path = require("path");
var fs = require("fs-extra");
var client_1 = require("@prisma/client");
function scanReadme(projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var findings, readmePath, content, lower, checks, failedChecks, _i, failedChecks_1, failed, score;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    findings = [];
                    readmePath = path.join(projectPath, 'README.md');
                    return [4 /*yield*/, fs.pathExists(readmePath)];
                case 1:
                    if (!(_a.sent())) {
                        return [2 /*return*/, {
                                score: 0,
                                findings: [
                                    {
                                        category: client_1.FindingCategory.README,
                                        severity: client_1.FindingSeverity.HIGH,
                                        title: 'README.md is missing',
                                        description: 'The project does not have a README.md file. Employers and users may not know how to run or understand the project.',
                                        filePath: 'README.md',
                                        suggestion: 'Add a README.md with project overview, features, tech stack, setup steps, environment variables, screenshots, and deployment link.',
                                    },
                                ],
                            }];
                    }
                    return [4 /*yield*/, fs.readFile(readmePath, 'utf8')];
                case 2:
                    content = _a.sent();
                    lower = content.toLowerCase();
                    checks = [
                        {
                            name: 'Project description',
                            passed: lower.includes('description') ||
                                lower.includes('overview') ||
                                content.length > 300,
                            suggestion: 'Add a clear project description or overview section.',
                        },
                        {
                            name: 'Features section',
                            passed: lower.includes('feature'),
                            suggestion: 'Add a features section that lists the main functionality.',
                        },
                        {
                            name: 'Tech stack section',
                            passed: lower.includes('tech stack') ||
                                lower.includes('technology') ||
                                lower.includes('built with'),
                            suggestion: 'Add a tech stack section listing frontend, backend, database, and tools.',
                        },
                        {
                            name: 'Installation steps',
                            passed: lower.includes('install') ||
                                lower.includes('npm install') ||
                                lower.includes('setup'),
                            suggestion: 'Add installation/setup steps.',
                        },
                        {
                            name: 'Run commands',
                            passed: lower.includes('npm run') ||
                                lower.includes('yarn') ||
                                lower.includes('pnpm'),
                            suggestion: 'Add commands for running the project locally.',
                        },
                        {
                            name: 'Environment variables',
                            passed: lower.includes('.env') ||
                                lower.includes('environment variable') ||
                                lower.includes('env variable'),
                            suggestion: 'Explain required environment variables and provide .env.example.',
                        },
                        {
                            name: 'Screenshots or demo',
                            passed: lower.includes('screenshot') ||
                                lower.includes('demo') ||
                                lower.includes('deployment') ||
                                lower.includes('live'),
                            suggestion: 'Add screenshots, demo GIF, or deployed live link.',
                        },
                    ];
                    failedChecks = checks.filter(function (check) { return !check.passed; });
                    for (_i = 0, failedChecks_1 = failedChecks; _i < failedChecks_1.length; _i++) {
                        failed = failedChecks_1[_i];
                        findings.push({
                            category: client_1.FindingCategory.README,
                            severity: client_1.FindingSeverity.MEDIUM,
                            title: "README missing: ".concat(failed.name),
                            description: "The README does not clearly include \"".concat(failed.name, "\"."),
                            filePath: 'README.md',
                            suggestion: failed.suggestion,
                        });
                    }
                    score = Math.round(((checks.length - failedChecks.length) / checks.length) * 100);
                    return [2 /*return*/, {
                            score: score,
                            findings: findings,
                        }];
            }
        });
    });
}
