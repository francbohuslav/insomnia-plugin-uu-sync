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
Object.defineProperty(exports, "__esModule", { value: true });
const filepathKey = "insomnia-plugin-uu-sync-filepath";
const lastKey = "insomnia-plugin-uu-sync-last";
class Storage {
    constructor(context) {
        this.context = context;
    }
    getPath(workSpaceName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.context.store.getItem(filepathKey + "-" + workSpaceName);
        });
    }
    setPath(workSpaceName, path) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.context.store.setItem(filepathKey + "-" + workSpaceName, path);
        });
    }
    isConfigured(workSpaceName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.context.store.hasItem(filepathKey + "-" + workSpaceName);
        });
    }
    setLast(workSpaceName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.context.store.setItem(lastKey, workSpaceName);
        });
    }
    getLast() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.context.store.getItem(lastKey);
        });
    }
}
exports.default = Storage;
//# sourceMappingURL=storage.js.map