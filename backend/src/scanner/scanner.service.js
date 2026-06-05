"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.ScannerService = void 0;
var common_1 = require("@nestjs/common");
var path = require("path");
var fs = require("fs-extra");
var simple_git_1 = require("simple-git");
var client_1 = require("@prisma/client");
var secret_scanner_1 = require("./secret-scanner");
var readme_scanner_1 = require("./readme-scanner");
var ScannerService = /** @class */ (function () {
    function ScannerService() {
    }
    ScannerService.prototype.scanRepository = function (repoUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var tempRoot, repoFolderName, clonePath, findings, secretFindings, readmeResult, envFindings, deploymentFindings, packageFindings, scores, summary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tempRoot = path.join(process.cwd(), 'tmp-scans');
                        return [4 /*yield*/, fs.ensureDir(tempRoot)];
                    case 1:
                        _a.sent();
                        repoFolderName = "repo-".concat(Date.now());
                        clonePath = path.join(tempRoot, repoFolderName);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 9, 11]);
                        return [4 /*yield*/, (0, simple_git_1.default)().clone(repoUrl, clonePath, ['--depth', '1'])];
                    case 3:
                        _a.sent();
                        findings = [];
                        return [4 /*yield*/, (0, secret_scanner_1.scanSecrets)(clonePath)];
                    case 4:
                        secretFindings = _a.sent();
                        findings.push.apply(findings, secretFindings);
                        return [4 /*yield*/, (0, readme_scanner_1.scanReadme)(clonePath)];
                    case 5:
                        readmeResult = _a.sent();
                        findings.push.apply(findings, readmeResult.findings);
                        return [4 /*yield*/, this.scanEnvConfig(clonePath)];
                    case 6:
                        envFindings = _a.sent();
                        findings.push.apply(findings, envFindings);
                        return [4 /*yield*/, this.scanDeploymentReadiness(clonePath)];
                    case 7:
                        deploymentFindings = _a.sent();
                        findings.push.apply(findings, deploymentFindings);
                        return [4 /*yield*/, this.scanPackageJson(clonePath)];
                    case 8:
                        packageFindings = _a.sent();
                        findings.push.apply(findings, packageFindings);
                        scores = this.calculateScores(findings, readmeResult.score);
                        summary = this.generateSummary(scores, findings);
                        return [2 /*return*/, {
                                findings: findings,
                                scores: scores,
                                summary: summary,
                            }];
                    case 9: return [4 /*yield*/, fs.remove(clonePath)];
                    case 10:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    ScannerService.prototype.scanEnvConfig = function (projectPath) {
        return __awaiter(this, void 0, void 0, function () {
            var findings, envPath, envExamplePath, hasEnv, hasEnvExample;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findings = [];
                        envPath = path.join(projectPath, '.env');
                        envExamplePath = path.join(projectPath, '.env.example');
                        return [4 /*yield*/, fs.pathExists(envPath)];
                    case 1:
                        hasEnv = _a.sent();
                        return [4 /*yield*/, fs.pathExists(envExamplePath)];
                    case 2:
                        hasEnvExample = _a.sent();
                        if (hasEnv) {
                            findings.push({
                                category: client_1.FindingCategory.ENV_CONFIG,
                                severity: client_1.FindingSeverity.CRITICAL,
                                title: '.env file committed',
                                description: 'A .env file exists in the repository. This may expose secrets such as API keys or database URLs.',
                                filePath: '.env',
                                suggestion: 'Remove .env from the repository, add it to .gitignore, rotate exposed secrets, and use .env.example for placeholders.',
                            });
                        }
                        if (!hasEnvExample) {
                            findings.push({
                                category: client_1.FindingCategory.ENV_CONFIG,
                                severity: client_1.FindingSeverity.MEDIUM,
                                title: '.env.example is missing',
                                description: 'The project does not include .env.example, making setup harder and less professional.',
                                filePath: '.env.example',
                                suggestion: 'Create a .env.example file with placeholder values for all required environment variables.',
                            });
                        }
                        return [2 /*return*/, findings];
                }
            });
        });
    };
    ScannerService.prototype.scanDeploymentReadiness = function (projectPath) {
        return __awaiter(this, void 0, void 0, function () {
            var findings, dockerfilePath, dockerComposePath, githubActionsPath, hasDockerfile, hasDockerCompose, hasGithubActions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findings = [];
                        dockerfilePath = path.join(projectPath, 'Dockerfile');
                        dockerComposePath = path.join(projectPath, 'docker-compose.yml');
                        githubActionsPath = path.join(projectPath, '.github', 'workflows');
                        return [4 /*yield*/, fs.pathExists(dockerfilePath)];
                    case 1:
                        hasDockerfile = _a.sent();
                        return [4 /*yield*/, fs.pathExists(dockerComposePath)];
                    case 2:
                        hasDockerCompose = _a.sent();
                        return [4 /*yield*/, fs.pathExists(githubActionsPath)];
                    case 3:
                        hasGithubActions = _a.sent();
                        if (!hasDockerfile) {
                            findings.push({
                                category: client_1.FindingCategory.DEPLOYMENT,
                                severity: client_1.FindingSeverity.LOW,
                                title: 'Dockerfile is missing',
                                description: 'No Dockerfile was found. This may make production deployment less consistent.',
                                filePath: 'Dockerfile',
                                suggestion: 'Add a Dockerfile so the application can be built and deployed consistently.',
                            });
                        }
                        if (!hasDockerCompose) {
                            findings.push({
                                category: client_1.FindingCategory.DEPLOYMENT,
                                severity: client_1.FindingSeverity.INFO,
                                title: 'docker-compose.yml is missing',
                                description: 'No docker-compose.yml was found. Local development setup may be harder for databases or services.',
                                filePath: 'docker-compose.yml',
                                suggestion: 'Add docker-compose.yml for local services such as PostgreSQL, Redis, or backend dependencies.',
                            });
                        }
                        if (!hasGithubActions) {
                            findings.push({
                                category: client_1.FindingCategory.DEPLOYMENT,
                                severity: client_1.FindingSeverity.LOW,
                                title: 'GitHub Actions workflow is missing',
                                description: 'No GitHub Actions workflow was found. The project may not have automated CI checks.',
                                filePath: '.github/workflows',
                                suggestion: 'Add a GitHub Actions workflow for linting, testing, and building the project.',
                            });
                        }
                        return [2 /*return*/, findings];
                }
            });
        });
    };
    ScannerService.prototype.scanPackageJson = function (projectPath) {
        return __awaiter(this, void 0, void 0, function () {
            var findings, packageJsonPath, packageJson, scripts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        findings = [];
                        packageJsonPath = path.join(projectPath, 'package.json');
                        return [4 /*yield*/, fs.pathExists(packageJsonPath)];
                    case 1:
                        if (!(_a.sent())) {
                            return [2 /*return*/, findings];
                        }
                        return [4 /*yield*/, fs.readJson(packageJsonPath)];
                    case 2:
                        packageJson = _a.sent();
                        scripts = packageJson.scripts || {};
                        if (!scripts.build) {
                            findings.push({
                                category: client_1.FindingCategory.DEPLOYMENT,
                                severity: client_1.FindingSeverity.MEDIUM,
                                title: 'Build script is missing',
                                description: 'package.json does not include a build script.',
                                filePath: 'package.json',
                                suggestion: 'Add a build script, for example "build": "next build" or "build": "nest build".',
                            });
                        }
                        if (!scripts.start && !scripts['start:prod']) {
                            findings.push({
                                category: client_1.FindingCategory.DEPLOYMENT,
                                severity: client_1.FindingSeverity.MEDIUM,
                                title: 'Production start script is missing',
                                description: 'package.json does not include a clear production start script.',
                                filePath: 'package.json',
                                suggestion: 'Add a production start script such as "start": "node dist/main.js".',
                            });
                        }
                        if (!scripts.test) {
                            findings.push({
                                category: client_1.FindingCategory.CODE_STRUCTURE,
                                severity: client_1.FindingSeverity.LOW,
                                title: 'Test script is missing',
                                description: 'package.json does not include a test script.',
                                filePath: 'package.json',
                                suggestion: 'Add a test script and include basic unit or integration tests.',
                            });
                        }
                        return [2 /*return*/, findings];
                }
            });
        });
    };
    ScannerService.prototype.calculateScores = function (findings, readmeScore) {
        var countByCategory = function (category) {
            return findings.filter(function (finding) { return finding.category === category; });
        };
        var scoreFromFindings = function (category, startingScore) {
            if (startingScore === void 0) { startingScore = 100; }
            var categoryFindings = countByCategory(category);
            var score = startingScore;
            for (var _i = 0, categoryFindings_1 = categoryFindings; _i < categoryFindings_1.length; _i++) {
                var finding = categoryFindings_1[_i];
                if (finding.severity === client_1.FindingSeverity.CRITICAL)
                    score -= 35;
                if (finding.severity === client_1.FindingSeverity.HIGH)
                    score -= 25;
                if (finding.severity === client_1.FindingSeverity.MEDIUM)
                    score -= 15;
                if (finding.severity === client_1.FindingSeverity.LOW)
                    score -= 8;
            }
            return Math.max(score, 0);
        };
        var securityScore = scoreFromFindings(client_1.FindingCategory.SECRET_RISK);
        var envScore = scoreFromFindings(client_1.FindingCategory.ENV_CONFIG);
        var deploymentScore = scoreFromFindings(client_1.FindingCategory.DEPLOYMENT);
        var codeStructureScore = scoreFromFindings(client_1.FindingCategory.CODE_STRUCTURE);
        var overallScore = Math.round((securityScore +
            readmeScore +
            envScore +
            deploymentScore +
            codeStructureScore) /
            5);
        return {
            securityScore: securityScore,
            readmeScore: readmeScore,
            envScore: envScore,
            deploymentScore: deploymentScore,
            codeStructureScore: codeStructureScore,
            overallScore: overallScore,
        };
    };
    ScannerService.prototype.generateSummary = function (scores, findings) {
        var criticalCount = findings.filter(function (finding) { return finding.severity === client_1.FindingSeverity.CRITICAL; }).length;
        var highCount = findings.filter(function (finding) { return finding.severity === client_1.FindingSeverity.HIGH; }).length;
        if (criticalCount > 0) {
            return "This project has critical security risks and should not be shared publicly until secrets or sensitive files are removed. Overall score: ".concat(scores.overallScore, "/100.");
        }
        if (highCount > 0) {
            return "This project has high-risk issues that should be fixed before using it as a portfolio project. Overall score: ".concat(scores.overallScore, "/100.");
        }
        if (scores.overallScore >= 80) {
            return "This project looks mostly portfolio-ready, with some improvements recommended. Overall score: ".concat(scores.overallScore, "/100.");
        }
        return "This project needs improvements in documentation, deployment, security, or structure before it is portfolio-ready. Overall score: ".concat(scores.overallScore, "/100.");
    };
    ScannerService = __decorate([
        (0, common_1.Injectable)()
    ], ScannerService);
    return ScannerService;
}());
exports.ScannerService = ScannerService;
