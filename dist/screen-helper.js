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
class ScreenHelper {
    static alertError(context, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield context.app.alert("Error!", message);
        });
    }
    static askNewWorkspaceFilePath(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield context.app.alert("Choose Insomnia workspace file", `Choose source file of new workspace. Confirm rewrite question.`);
            const path = yield context.app.showSaveDialog();
            return ScreenHelper.normalizePath(path);
        });
    }
    static catchErrors(context, action, finalAction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield action();
                const res = finalAction();
                if (res instanceof Promise) {
                    yield res;
                }
            }
            catch (ex) {
                const res = finalAction();
                if (res instanceof Promise) {
                    yield res;
                }
                console.error(ex);
                if (ex.constructor.name === "AppError") {
                    yield ScreenHelper.alertError(context, ex.message);
                }
                else {
                    yield ScreenHelper.alertError(context, ex.message + "\nMore in debug console");
                }
            }
        });
    }
    static normalizePath(path) {
        if (path == null || path == "undefined") {
            return null;
        }
        return path;
    }
}
exports.default = ScreenHelper;
//# sourceMappingURL=screen-helper.js.map