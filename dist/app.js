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
const file_normalizer_1 = __importDefault(require("./file-normalizer"));
const screen_helper_1 = __importDefault(require("./screen-helper"));
const workspace_saver_1 = __importDefault(require("./workspace-saver"));
const storage_1 = __importDefault(require("./storage"));
const os_1 = __importDefault(require("os"));
const path_1 = require("path");
const json_to_table_1 = require("./json-to-table");
const import_manager_1 = require("./import-manager");
class App {
    export(context, models) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = new storage_1.default(context);
            if (!(yield this.verifyConfig(storage, context, models.workspace.name))) {
                return;
            }
            yield storage.setLast(models.workspace.name);
            const path = yield storage.getPath(models.workspace.name);
            const oneLineJson = yield context.data.export.insomnia({
                includePrivate: false,
                format: "json",
                workspace: models.workspace,
            });
            const normalizer = new file_normalizer_1.default();
            const jsonObject = normalizer.normalizeExport(oneLineJson);
            const workspaceSaver = new workspace_saver_1.default(path);
            yield workspaceSaver.exportOneFile(jsonObject);
            yield workspaceSaver.exportMultipleFiles(jsonObject);
        });
    }
    import(context, models) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = new storage_1.default(context);
            let path = null;
            if (yield this.verifyConfig(storage, context, models.workspace.name)) {
                path = yield storage.getPath(models.workspace.name);
            }
            else {
                path = yield screen_helper_1.default.askNewWorkspaceFilePath(context);
            }
            if (!path) {
                return;
            }
            const workspaceSaver = new workspace_saver_1.default(path);
            let json = yield workspaceSaver.importMultipleFiles();
            if (json.resources) {
                const workSpace = json.resources.filter((r) => r._type == "workspace")[0];
                if (workSpace) {
                    yield storage.setLast(workSpace.name);
                    yield storage.setPath(workSpace.name, path);
                }
            }
            yield context.data.import.raw(JSON.stringify(json));
        });
    }
    importLast(context, models) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = new storage_1.default(context);
            let lastWorkspace = yield storage.getLast();
            lastWorkspace = yield screen_helper_1.default.askLastWorkspace(context, lastWorkspace);
            if (!lastWorkspace) {
                return;
            }
            if (!(yield this.verifyConfig(storage, context, lastWorkspace))) {
                return;
            }
            const path = yield storage.getPath(lastWorkspace);
            const workspaceSaver = new workspace_saver_1.default(path);
            let json = yield workspaceSaver.importMultipleFiles();
            yield context.data.import.raw(JSON.stringify(json));
        });
    }
    showImportManager(context, models) {
        context.app.dialog("Import manager", new import_manager_1.ImportManager().getManagerDom(), {
            wide: true,
            tall: true,
            skinny: false,
            // onHide: () => {
            //   console.log("ishiding");
            // },
        });
    }
    //TODO: BF: zrusit
    connectWithFile(context, models) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = new storage_1.default(context);
            const filePath = yield screen_helper_1.default.askExistingWorkspaceFilePath(context, {
                currentPath: yield storage.getPath(models.workspace.name),
                workspaceName: "insomnia-workspace.json",
            });
            if (filePath == null) {
                return;
            }
            yield storage.setPath(models.workspace.name, filePath);
            yield storage.setLast(models.workspace.name);
        });
    }
    showDataAsTable(context, models) {
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
                // onHide: () => {
                //   console.log("ishiding");
                // },
            });
        });
    }
    processResponse(context, models) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(context, models);
            try {
                const resp = this.bufferToJsonObj(context.response.getBody());
                this.lastResponseJsonBody = resp;
            }
            catch (_a) {
                // no-op
            }
        });
    }
    getConnectionFileLabelString() {
        return "uuSync - Connect with file";
    }
    verifyConfig(storage, context, workspaceName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield storage.isConfigured(workspaceName)) {
                return true;
            }
            screen_helper_1.default.alertError(context, `Workspace not configured! Click on '${this.getConnectionFileLabelString()}' first.`);
            return false;
        });
    }
    bufferToJsonObj(buf) {
        return JSON.parse(buf.toString("utf-8"));
    }
    jsonObjToBuffer(obj) {
        return Buffer.from(JSON.stringify(obj), "utf-8");
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map