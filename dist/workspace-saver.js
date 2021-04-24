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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var file_normalizer_1 = __importDefault(require("./file-normalizer"));
var fs = require("fs");
var path = require("path");
var promisify = require("util").promisify;
var mkdir = promisify(fs.mkdir);
var writeFile = promisify(fs.writeFile);
var readFile = promisify(fs.readFile);
var readdir = promisify(fs.readdir);
var unlink = promisify(fs.unlink);
var WorkspaceSaver = /** @class */ (function () {
    function WorkspaceSaver(insomniaFilePath) {
        this.insomniaFilePath = insomniaFilePath;
        this.folderPath = insomniaFilePath + "-resources";
        this.workspaceFile = path.join(this.folderPath, "_workspace.json");
    }
    WorkspaceSaver.prototype.exportOneFile = function (jsonObject) {
        return __awaiter(this, void 0, void 0, function () {
            var formattedJson;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        formattedJson = JSON.stringify(jsonObject, null, 2);
                        return [4 /*yield*/, writeFile(this.insomniaFilePath, formattedJson)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WorkspaceSaver.prototype.exportMultipleFiles = function (jsonObject) {
        return __awaiter(this, void 0, void 0, function () {
            var resourcesOnDisk, filesToRemove, _i, _a, resource, _b, filesToRemove_1, fileName, fullFilePath, formattedJson;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        jsonObject = JSON.parse(JSON.stringify(jsonObject));
                        return [4 /*yield*/, mkdir(this.folderPath, { recursive: true })];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.getResourcesFiles()];
                    case 2:
                        resourcesOnDisk = _c.sent();
                        filesToRemove = resourcesOnDisk.filter(function (fileName) { return jsonObject.resources.filter(function (r) { return r._id + ".json" == fileName; }).length == 0; });
                        _i = 0, _a = jsonObject.resources;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        resource = _a[_i];
                        return [4 /*yield*/, this.saveResource(resource)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        _b = 0, filesToRemove_1 = filesToRemove;
                        _c.label = 7;
                    case 7:
                        if (!(_b < filesToRemove_1.length)) return [3 /*break*/, 10];
                        fileName = filesToRemove_1[_b];
                        fullFilePath = path.join(this.folderPath, fileName);
                        return [4 /*yield*/, unlink(fullFilePath)];
                    case 8:
                        _c.sent();
                        _c.label = 9;
                    case 9:
                        _b++;
                        return [3 /*break*/, 7];
                    case 10:
                        jsonObject.resources = jsonObject.resources.map(this.getResourceIdWithName);
                        formattedJson = JSON.stringify(jsonObject, null, 2);
                        return [4 /*yield*/, writeFile(this.workspaceFile, formattedJson)];
                    case 11:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WorkspaceSaver.prototype.importMultipleFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var formattedJson, jsonObject, normalizer, formattedJson, jsonObject, resourcesIds, _i, resourcesIds_1, resourceIdWithName, resourceId, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!fs.existsSync(this.workspaceFile)) return [3 /*break*/, 2];
                        return [4 /*yield*/, readFile(this.insomniaFilePath, "utf8")];
                    case 1:
                        formattedJson = _c.sent();
                        jsonObject = JSON.parse(formattedJson);
                        normalizer = new file_normalizer_1.default();
                        jsonObject = normalizer.normalizeImport(jsonObject);
                        return [2 /*return*/, jsonObject];
                    case 2: return [4 /*yield*/, readFile(this.workspaceFile, "utf8")];
                    case 3:
                        formattedJson = _c.sent();
                        jsonObject = JSON.parse(formattedJson);
                        resourcesIds = __spreadArray([], jsonObject.resources);
                        jsonObject.resources = [];
                        _i = 0, resourcesIds_1 = resourcesIds;
                        _c.label = 4;
                    case 4:
                        if (!(_i < resourcesIds_1.length)) return [3 /*break*/, 7];
                        resourceIdWithName = resourcesIds_1[_i];
                        resourceId = this.getResourceIdFromIdWithName(resourceIdWithName);
                        _b = (_a = jsonObject.resources).push;
                        return [4 /*yield*/, this.loadResource(resourceId)];
                    case 5:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, jsonObject];
                }
            });
        });
    };
    WorkspaceSaver.prototype.getResourcesFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, readdir(this.folderPath)];
                    case 1:
                        files = _a.sent();
                        return [2 /*return*/, files.filter(function (file) { return file != "_workspace.json"; })];
                }
            });
        });
    };
    WorkspaceSaver.prototype.getResourceIdWithName = function (resource) {
        return resource._id + " | " + resource.name;
    };
    WorkspaceSaver.prototype.getResourceIdFromIdWithName = function (resourceIdWithName) {
        return resourceIdWithName.split("|")[0].trim();
    };
    WorkspaceSaver.prototype.saveResource = function (resource) {
        return __awaiter(this, void 0, void 0, function () {
            var fullFilePath, formattedJson;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullFilePath = path.join(this.folderPath, resource._id + ".json");
                        if (resource._type == "request" && resource.body && resource.body.text) {
                            resource.body.text = resource.body.text.split("\n");
                        }
                        formattedJson = JSON.stringify(resource, null, 2);
                        return [4 /*yield*/, writeFile(fullFilePath, formattedJson)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WorkspaceSaver.prototype.loadResource = function (resourceId) {
        return __awaiter(this, void 0, void 0, function () {
            var fullFilePath, formattedJson, resource;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullFilePath = path.join(this.folderPath, resourceId + ".json");
                        return [4 /*yield*/, readFile(fullFilePath)];
                    case 1:
                        formattedJson = _a.sent();
                        resource = JSON.parse(formattedJson);
                        if (resource._type == "request" && resource.body && resource.body.text) {
                            resource.body.text = resource.body.text.join("\n");
                        }
                        return [2 /*return*/, resource];
                }
            });
        });
    };
    return WorkspaceSaver;
}());
exports.default = WorkspaceSaver;
//# sourceMappingURL=workspace-saver.js.map