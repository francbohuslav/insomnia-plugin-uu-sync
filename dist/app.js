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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const path_1 = require("path");
const import_manager_1 = require("./import-manager");
const json_to_table_1 = require("./json-to-table");
const screen_helper_1 = __importDefault(require("./screen-helper"));
const storage_1 = __importDefault(require("./storage"));
class App {
    exportActualWorkspace(context, models) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = new storage_1.default(context);
            const workspaceConfig = yield this.verifyConfig(storage, context, models.workspace.name);
            if (!workspaceConfig) {
                return;
            }
            const importManager = new import_manager_1.ImportManager(context);
            yield importManager.exportWorkspace(workspaceConfig);
        });
    }
    importActualWorkspace(context, models) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = new storage_1.default(context);
            const workspaceConfig = yield this.verifyConfig(storage, context, models.workspace.name);
            if (!workspaceConfig) {
                return;
            }
            const importManager = new import_manager_1.ImportManager(context);
            yield importManager.importWorkspace(workspaceConfig.path);
        });
    }
    showImportManager(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const node = yield new import_manager_1.ImportManager(context).getManagerDom();
            context.app.dialog("Import manager", node, {
                wide: true,
                tall: true,
                skinny: false,
            });
        });
    }
    showDataAsTable(context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.lastResponseJsonBody) {
                this.lastResponseJsonBody = {
                    itemList: [
                        {
                            Message: "run some request with response.itemList first",
                        },
                    ],
                };
            }
            var jsonToTable = new json_to_table_1.JsonToTable();
            const whole = document.createElement("div");
            whole.style.padding = "10px";
            const link = document.createElement("button");
            link.classList.add("tag");
            link.classList.add("bg-info");
            link.style.marginBottom = "0.5em";
            link.innerText = "Save to file";
            link.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const filePath = path_1.join(os_1.default.tmpdir(), "insomnia-response-table.html");
                yield jsonToTable.saveToFile(filePath, html);
            }));
            whole.appendChild(link);
            const table = document.createElement("div");
            const html = jsonToTable.getTableHtml(this.lastResponseJsonBody);
            table.innerHTML = html;
            whole.appendChild(table);
            context.app.dialog("Response as table", whole, {
                wide: true,
                tall: true,
                skinny: false,
            });
        });
    }
    processResponse(context) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resp = this.bufferToJsonObj(context.response.getBody());
                this.lastResponseJsonBody = resp;
            }
            catch (_a) {
                // no-op
            }
        });
    }
    verifyConfig(storage, context, workspaceName) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield storage.getConfig();
            const workspaceConfig = Object.values(config.workspaces).find((w) => w.data.name === workspaceName);
            if (workspaceConfig) {
                return workspaceConfig;
            }
            screen_helper_1.default.alertError(context, `Workspace ${workspaceName} not configured! Import workspace in import manager.`);
            return null;
        });
    }
    bufferToJsonObj(buf) {
        return JSON.parse(buf.toString("utf-8"));
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map