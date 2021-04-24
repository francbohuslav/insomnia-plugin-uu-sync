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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var file_normalizer_1 = __importDefault(require("./file-normalizer"));
var screen_helper_1 = __importDefault(require("./screen-helper"));
var workspace_saver_1 = __importDefault(require("./workspace-saver"));
var storage_1 = __importDefault(require("./storage"));
var App = /** @class */ (function () {
    function App() {
    }
    App.prototype.export = function (context, models) {
        return __awaiter(this, void 0, void 0, function () {
            var storage, path, oneLineJson, normalizer, jsonObject, workspaceSaver;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        storage = new storage_1.default(context);
                        return [4 /*yield*/, this.verifyConfig(storage, context, models.workspace.name)];
                    case 1:
                        if (!(_a.sent())) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, storage.setLast(models.workspace.name)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, storage.getPath(models.workspace.name)];
                    case 3:
                        path = _a.sent();
                        return [4 /*yield*/, context.data.export.insomnia({
                                includePrivate: false,
                                format: "json",
                                workspace: models.workspace,
                            })];
                    case 4:
                        oneLineJson = _a.sent();
                        normalizer = new file_normalizer_1.default();
                        jsonObject = normalizer.normalizeExport(oneLineJson);
                        workspaceSaver = new workspace_saver_1.default(path);
                        return [4 /*yield*/, workspaceSaver.exportOneFile(jsonObject)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, workspaceSaver.exportMultipleFiles(jsonObject)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    App.prototype.import = function (context, models) {
        return __awaiter(this, void 0, void 0, function () {
            var storage, path, workspaceSaver, json, workSpace;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        storage = new storage_1.default(context);
                        path = null;
                        return [4 /*yield*/, this.verifyConfig(storage, context, models.workspace.name)];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, storage.getPath(models.workspace.name)];
                    case 2:
                        path = _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, screen_helper_1.default.askNewWorkspaceFilePath(context)];
                    case 4:
                        path = _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!path) {
                            return [2 /*return*/];
                        }
                        workspaceSaver = new workspace_saver_1.default(path);
                        return [4 /*yield*/, workspaceSaver.importMultipleFiles()];
                    case 6:
                        json = _a.sent();
                        if (!json.resources) return [3 /*break*/, 9];
                        workSpace = json.resources.filter(function (r) { return r._type == "workspace"; })[0];
                        if (!workSpace) return [3 /*break*/, 9];
                        return [4 /*yield*/, storage.setLast(workSpace.name)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, storage.setPath(workSpace.name, path)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [4 /*yield*/, context.data.import.raw(JSON.stringify(json))];
                    case 10:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    App.prototype.importLast = function (context, models) {
        return __awaiter(this, void 0, void 0, function () {
            var storage, lastWorkspace, path, workspaceSaver, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        storage = new storage_1.default(context);
                        return [4 /*yield*/, storage.getLast()];
                    case 1:
                        lastWorkspace = _a.sent();
                        return [4 /*yield*/, screen_helper_1.default.askLastWorkspace(context, lastWorkspace)];
                    case 2:
                        lastWorkspace = _a.sent();
                        if (!lastWorkspace) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.verifyConfig(storage, context, lastWorkspace)];
                    case 3:
                        if (!(_a.sent())) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, storage.getPath(lastWorkspace)];
                    case 4:
                        path = _a.sent();
                        workspaceSaver = new workspace_saver_1.default(path);
                        return [4 /*yield*/, workspaceSaver.importMultipleFiles()];
                    case 5:
                        json = _a.sent();
                        return [4 /*yield*/, context.data.import.raw(JSON.stringify(json))];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    App.prototype.connectWithFile = function (context, models) {
        return __awaiter(this, void 0, void 0, function () {
            var storage, filePath, _a, _b, _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        storage = new storage_1.default(context);
                        _b = (_a = screen_helper_1.default).askExistingWorkspaceFilePath;
                        _c = [context];
                        _d = {};
                        return [4 /*yield*/, storage.getPath(models.workspace.name)];
                    case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([(_d.currentPath = _e.sent(),
                                _d.workspaceName = "insomnia-workspace.json",
                                _d)]))];
                    case 2:
                        filePath = _e.sent();
                        if (filePath == null) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, storage.setPath(models.workspace.name, filePath)];
                    case 3:
                        _e.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    App.prototype.getLabelString = function () {
        return "uuSync - Connect with file";
    };
    App.prototype.verifyConfig = function (storage, context, workspaceName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, storage.isConfigured(workspaceName)];
                    case 1:
                        if (_a.sent()) {
                            return [2 /*return*/, true];
                        }
                        screen_helper_1.default.alertError(context, "Workspace not configured! Click on '" + this.getLabelString() + "' first.");
                        return [2 /*return*/, false];
                }
            });
        });
    };
    return App;
}());
exports.default = App;
//# sourceMappingURL=app.js.map