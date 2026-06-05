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
exports.scanSecrets = scanSecrets;
var path = require("path");
var fs = require("fs-extra");
var client_1 = require("@prisma/client");
var SECRET_PATTERNS = [
    {
        name: 'Possible AWS Access Key',
        regex: /AKIA[0-9A-Z]{16}/,
        severity: client_1.FindingSeverity.CRITICAL,
    },
    {
        name: 'Possible Stripe Secret Key',
        regex: /sk_live_[0-9a-zA-Z]+/,
        severity: client_1.FindingSeverity.CRITICAL,
    },
    {
        name: 'Possible JWT Secret',
        regex: /JWT_SECRET\s*=\s*.+/i,
        severity: client_1.FindingSeverity.HIGH,
    },
    {
        name: 'Possible Database URL',
        regex: /(DATABASE_URL|MONGO_URI|POSTGRES_URL)\s*=\s*.+/i,
        severity: client_1.FindingSeverity.HIGH,
    },
    {
        name: 'Possible Private Key',
        regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
        severity: client_1.FindingSeverity.CRITICAL,
    },
];
var DANGEROUS_FILE_NAMES = [
    '.env',
    'serviceAccountKey.json',
    'firebase-adminsdk.json',
    'google-credentials.json',
];
var IGNORE_DIRS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    '.vercel',
];
function shouldIgnore(filePath) {
    return IGNORE_DIRS.some(function (dir) { return filePath.includes("".concat(path.sep).concat(dir).concat(path.sep)); });
}
function getAllFiles(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var entries, files;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.readdir(dir, { withFileTypes: true })];
                case 1:
                    entries = _a.sent();
                    return [4 /*yield*/, Promise.all(entries.map(function (entry) { return __awaiter(_this, void 0, void 0, function () {
                            var fullPath;
                            return __generator(this, function (_a) {
                                fullPath = path.join(dir, entry.name);
                                if (shouldIgnore(fullPath)) {
                                    return [2 /*return*/, []];
                                }
                                if (entry.isDirectory()) {
                                    return [2 /*return*/, getAllFiles(fullPath)];
                                }
                                return [2 /*return*/, [fullPath]];
                            });
                        }); }))];
                case 2:
                    files = _a.sent();
                    return [2 /*return*/, files.flat()];
            }
        });
    });
}
function scanSecrets(projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var findings, files, _loop_1, _i, files_1, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    findings = [];
                    return [4 /*yield*/, getAllFiles(projectPath)];
                case 1:
                    files = _a.sent();
                    _loop_1 = function (file) {
                        var relativePath, fileName, stat, content, _b, lines;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    relativePath = path.relative(projectPath, file);
                                    fileName = path.basename(file);
                                    if (DANGEROUS_FILE_NAMES.includes(fileName)) {
                                        findings.push({
                                            category: client_1.FindingCategory.SECRET_RISK,
                                            severity: client_1.FindingSeverity.CRITICAL,
                                            title: "Sensitive file committed: ".concat(fileName),
                                            description: "The file \"".concat(relativePath, "\" may contain private credentials or environment secrets."),
                                            filePath: relativePath,
                                            suggestion: 'Remove this file from the repository, rotate exposed credentials, add it to .gitignore, and use environment variables instead.',
                                        });
                                    }
                                    return [4 /*yield*/, fs.stat(file)];
                                case 1:
                                    stat = _c.sent();
                                    if (stat.size > 500000) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    content = '';
                                    _c.label = 2;
                                case 2:
                                    _c.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, fs.readFile(file, 'utf8')];
                                case 3:
                                    content = _c.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    _b = _c.sent();
                                    return [2 /*return*/, "continue"];
                                case 5:
                                    lines = content.split('\n');
                                    lines.forEach(function (line, index) {
                                        for (var _i = 0, SECRET_PATTERNS_1 = SECRET_PATTERNS; _i < SECRET_PATTERNS_1.length; _i++) {
                                            var pattern = SECRET_PATTERNS_1[_i];
                                            if (pattern.regex.test(line)) {
                                                findings.push({
                                                    category: client_1.FindingCategory.SECRET_RISK,
                                                    severity: pattern.severity,
                                                    title: pattern.name,
                                                    description: "A possible secret was detected in \"".concat(relativePath, "\"."),
                                                    filePath: relativePath,
                                                    lineNumber: index + 1,
                                                    suggestion: 'Move secrets into environment variables, rotate the exposed key, and remove it from Git history.',
                                                });
                                            }
                                        }
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, files_1 = files;
                    _a.label = 2;
                case 2:
                    if (!(_i < files_1.length)) return [3 /*break*/, 5];
                    file = files_1[_i];
                    return [5 /*yield**/, _loop_1(file)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, findings];
            }
        });
    });
}
