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
    static askExistingWorkspaceFilePath(context, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield context.app.alert("Choose Insomnia workspace file", `Choose target file for import/export of current workspace. Confirm rewrite if you choose existing file. Actual: ${options.currentPath}`);
            const path = yield context.app.showSaveDialog({ defaultPath: options.workspaceName });
            return ScreenHelper.normalizePath(path);
        });
    }
    static askNewWorkspaceFilePath(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield context.app.alert("Choose Insomnia workspace file", `Choose source file of new workspace. Confirm rewrite question.`);
            const path = yield context.app.showSaveDialog();
            return ScreenHelper.normalizePath(path);
        });
    }
    static askLastWorkspace(context, lastWorkspace) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield context.app.prompt("Workspace to import", {
                    label: "Specify name of workspace to import. Can be also some used but removed from Insomnia.",
                    defaultValue: lastWorkspace || "",
                    submitName: "Import",
                    cancelable: true,
                });
            }
            catch (error) {
                return null;
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