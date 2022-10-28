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
exports.ImportManager = void 0;
const app_error_1 = require("./app-error");
const file_normalizer_1 = __importDefault(require("./file-normalizer"));
const insomnia_file_1 = require("./insomnia-file");
const screen_helper_1 = __importDefault(require("./screen-helper"));
const storage_1 = __importDefault(require("./storage"));
const workspace_saver_1 = __importDefault(require("./workspace-saver"));
class ImportManager {
    constructor(context, models) {
        this.context = context;
        this.models = models;
        this.storage = new storage_1.default(this.context);
    }
    getManagerDom() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.storage.getConfig();
            const wholeDom = document.createElement("div");
            wholeDom.classList.add("import-manager");
            wholeDom.style.padding = "10px";
            wholeDom.innerHTML = `
    <style>
    .import-manager{
      padding: 10px;
      position:relative;
    }
    .import-manager td, .import-manager th {
      padding: 4px 20px;
    }
    .import-manager .buttons{
      margin-bottom: 0.5em;
    }
    .import-manager .overlay{
      background: rgb(255,255,255,0.7);
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: none;
      justify-content: center;
      align-items: center;
      font-size: 30px;
      min-height: 200px;
    }
    </style>
    <div class="buttons"></div>
    <table><thead></thead><tbody></tbody></table>`;
            const buttons = wholeDom.querySelector(".buttons");
            const newImport = document.createElement("button");
            newImport.classList.add("tag");
            newImport.classList.add("bg-info");
            newImport.innerText = "Add new workspace";
            newImport.addEventListener("click", () => this.newImportWizard(wholeDom));
            buttons.appendChild(newImport);
            this.refreshGui(config, wholeDom);
            const overlay = document.createElement("div");
            overlay.classList.add("overlay");
            wholeDom.appendChild(overlay);
            return wholeDom;
        });
    }
    refreshGui(config, wholeDom) {
        const tableHead = wholeDom.querySelector("table > thead");
        tableHead.innerHTML = `<tr><th>Workspace</th><th>Path</th><th>Actions</th></tr>`;
        const tableBody = wholeDom.querySelector("table > tbody");
        tableBody.innerHTML = "";
        const workspaces = Object.values(config.workspaces);
        const tr = document.createElement("tr");
        let td = document.createElement("td");
        td.innerHTML = `${workspaces.length}x`;
        tr.appendChild(td);
        td = document.createElement("td");
        const commonPath = this.getCommonPath(workspaces);
        td.innerHTML = commonPath ? commonPath + "..." : "";
        tr.appendChild(td);
        td = document.createElement("td");
        let button = document.createElement("button");
        button.classList.add("tag");
        button.classList.add("bg-info");
        button.innerText = "Import all";
        button.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            screen_helper_1.default.catchErrors(this.context, () => __awaiter(this, void 0, void 0, function* () {
                for (const workspace of workspaces) {
                    this.showLoading(wholeDom, true, workspace.data.name);
                    yield this.importWorkspace(workspace.path);
                }
                const config = yield this.storage.getConfig();
                this.refreshGui(config, wholeDom);
            }), () => {
                this.showLoading(wholeDom, false);
            });
        }));
        td.appendChild(button);
        button = document.createElement("button");
        button.classList.add("tag");
        button.classList.add("bg-info");
        button.innerText = "Export all";
        button.addEventListener("click", () => {
            screen_helper_1.default.catchErrors(this.context, () => __awaiter(this, void 0, void 0, function* () {
                this.showLoading(wholeDom, true, "0%");
                let counter = 0;
                const config = yield this.storage.getConfig();
                yield Promise.all([...workspaces].map((workspace) => this.exportWorkspace(workspace).then(() => {
                    counter++;
                    this.showLoading(wholeDom, true, ((counter / workspaces.length) * 100).toFixed(0) + "%");
                })));
                this.refreshGui(config, wholeDom);
            }), () => this.showLoading(wholeDom, false));
        });
        td.appendChild(button);
        tr.appendChild(td);
        tableBody.appendChild(tr);
        workspaces.sort((a, b) => a.data.name.localeCompare(b.data.name));
        workspaces.forEach((workspace) => {
            const tr = document.createElement("tr");
            let td = document.createElement("td");
            td.innerHTML = `<strong>${workspace.data.name}</strong>`;
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerText = (commonPath.length > 0 ? "..." : "") + workspace.path.slice(commonPath.length);
            tr.appendChild(td);
            td = document.createElement("td");
            let button = document.createElement("button");
            button.classList.add("tag");
            button.classList.add("bg-info");
            button.innerText = "Import";
            button.addEventListener("click", () => this.importWorkspaceByGui(workspace.path, wholeDom));
            td.appendChild(button);
            button = document.createElement("button");
            button.classList.add("tag");
            button.classList.add("bg-info");
            button.innerText = "Export";
            button.addEventListener("click", () => this.exportWorkspaceByGui(workspace, wholeDom));
            td.appendChild(button);
            button = document.createElement("button");
            button.classList.add("tag");
            button.classList.add("bg-danger");
            button.innerText = "Delete";
            button.addEventListener("click", () => this.deleteWorkspaceByGui(workspace, wholeDom));
            td.appendChild(button);
            tr.appendChild(td);
            tableBody.appendChild(tr);
        });
    }
    newImportWizard(wholeDom) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = yield screen_helper_1.default.askNewWorkspaceFilePath(this.context);
            if (filePath == null) {
                return;
            }
            yield this.importWorkspaceByGui(filePath, wholeDom);
        });
    }
    importWorkspaceByGui(filePath, wholeDom, progress) {
        return screen_helper_1.default.catchErrors(this.context, () => __awaiter(this, void 0, void 0, function* () {
            this.showLoading(wholeDom, true, progress);
            yield this.importWorkspace(filePath);
            const config = yield this.storage.getConfig();
            this.refreshGui(config, wholeDom);
        }), () => {
            this.showLoading(wholeDom, false);
        });
    }
    exportWorkspaceByGui(workspace, wholeDom, progress) {
        return screen_helper_1.default.catchErrors(this.context, () => __awaiter(this, void 0, void 0, function* () {
            this.showLoading(wholeDom, true, progress);
            const config = yield this.storage.getConfig();
            yield this.exportWorkspace(workspace);
            this.refreshGui(config, wholeDom);
        }), () => {
            this.showLoading(wholeDom, false);
        });
    }
    exportWorkspace(workspaceConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const oneLineJson = yield this.context.data.export.insomnia({
                includePrivate: false,
                format: "json",
                workspace: {
                    _id: workspaceConfig.data._id,
                    created: workspaceConfig.data.created,
                    description: workspaceConfig.data.description,
                    modified: workspaceConfig.data.modified,
                    name: workspaceConfig.data.name,
                    parentId: workspaceConfig.data.parentId,
                    scope: workspaceConfig.data.scope,
                    // This is only difference
                    type: workspaceConfig.data._type,
                },
            });
            const normalizer = new file_normalizer_1.default();
            const jsonObject = normalizer.normalizeExport(oneLineJson);
            const workspaceSaver = new workspace_saver_1.default(workspaceConfig.path);
            yield workspaceSaver.exportOneFile(jsonObject);
            yield workspaceSaver.exportMultipleFiles(jsonObject);
        });
    }
    deleteWorkspaceByGui(workspace, wholeDom) {
        return __awaiter(this, void 0, void 0, function* () {
            return screen_helper_1.default.catchErrors(this.context, () => __awaiter(this, void 0, void 0, function* () {
                let workSpaceName;
                try {
                    workSpaceName = yield this.context.app.prompt("Do you really want to remove this workspace from list? Workspace will not be delete from Insomnia.", {
                        cancelable: true,
                        defaultValue: workspace.data.name,
                        submitName: "Yes, delete it",
                        label: "Workspace",
                    });
                }
                catch (ex) {
                    console.error("Dialog canceled", ex);
                }
                if (!workSpaceName) {
                    return;
                }
                const config = yield this.storage.getConfig();
                workspace = Object.values(config.workspaces).find((w) => w.data.name === workSpaceName.trim());
                this.showLoading(wholeDom, true);
                delete config.workspaces[workspace.path];
                yield this.storage.setConfig(config);
                this.refreshGui(config, wholeDom);
            }), () => {
                this.showLoading(wholeDom, false);
            });
        });
    }
    importWorkspace(filePath) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceSaver = new workspace_saver_1.default(filePath);
            let json = yield workspaceSaver.loadWorkspaceFile();
            let workspace = (_a = json.resources) === null || _a === void 0 ? void 0 : _a.filter((r) => insomnia_file_1.InsomniaFile.isWorkspaceResource(r))[0];
            const config = yield this.storage.getConfig();
            this.checkWorkspaceUniqueness(config, workspace);
            yield this.context.data.import.raw(JSON.stringify(json));
            config.workspaces[filePath] = {
                path: filePath,
                data: workspace,
            };
            yield this.storage.setConfig(config);
        });
    }
    checkWorkspaceUniqueness(config, workspace) {
        const existingWorkspace = Object.values(config.workspaces).find((w) => w.data._id === workspace._id);
        if (existingWorkspace) {
            throw new app_error_1.AppError(`This workspace already exists in different path ${existingWorkspace.path}.\nImport canceled, to avoid unexpected result. Different workspaces must use unique id. 
      If some workspace is based of existing one, than must be duplicated by Insomnia to have different unique id.\nIf you really want import this workspace, thus delete existing one from Insomnia and from this import manager.`);
        }
    }
    showLoading(wholeDom, on, progress) {
        const overlay = wholeDom.querySelector(".overlay");
        overlay.style.display = on ? "flex" : "none";
        overlay.innerText = "Working, wait..." + (progress !== undefined ? ` ${progress}` : "");
    }
    getCommonPath(workspaces) {
        var _a;
        let commonPath = ((_a = workspaces[0]) === null || _a === void 0 ? void 0 : _a.path) || "";
        for (const workspace of workspaces) {
            const c1Parts = commonPath.split("");
            const c2Parts = workspace.path.split("");
            for (let i = 0; i < Math.min(c1Parts.length, c2Parts.length); i++) {
                if (c1Parts[i] != c2Parts[i]) {
                    commonPath = commonPath.substring(0, i);
                    break;
                }
            }
        }
        return commonPath;
    }
}
exports.ImportManager = ImportManager;
//# sourceMappingURL=import-manager.js.map