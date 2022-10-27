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
      padding: 4px 8px;
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
            overlay.innerText = "Working, wait...";
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
        workspaces.sort((a, b) => a.name.localeCompare(b.name));
        workspaces.forEach((workspace) => {
            const tr = document.createElement("tr");
            let td = document.createElement("td");
            td.innerHTML = `<strong>${workspace.name}</strong>`;
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerText = workspace.path;
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
            button.innerText = "Delete";
            button.addEventListener("click", () => this.deleteWorkspace(workspace, wholeDom));
            td.appendChild(button);
            tr.appendChild(td);
            tableBody.appendChild(tr);
        });
    }
    newImportWizard(wholeDom) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = yield screen_helper_1.default.askExistingWorkspaceFilePath(this.context);
            if (filePath == null) {
                return;
            }
            yield this.importWorkspaceByGui(filePath, wholeDom);
        });
    }
    importWorkspaceByGui(filePath, wholeDom) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.showLoading(wholeDom, true);
                yield this.importWorkspace(filePath);
                const config = yield this.storage.getConfig();
                this.refreshGui(config, wholeDom);
                this.showLoading(wholeDom, false);
            }
            catch (ex) {
                this.showLoading(wholeDom, false);
                throw ex;
            }
        });
    }
    deleteWorkspace(workspace, wholeDom) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let workSpaceName;
                try {
                    workSpaceName = yield this.context.app.prompt("Do you really want to remove this workspace from list? Workspace will not be delete from Insomnia.", {
                        cancelable: true,
                        defaultValue: workspace.name,
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
                workspace = Object.values(config.workspaces).find((w) => w.name === workSpaceName.trim());
                this.showLoading(wholeDom, true);
                delete config.workspaces[workspace.path];
                yield this.storage.setConfig(config);
                this.refreshGui(config, wholeDom);
                this.showLoading(wholeDom, false);
            }
            catch (ex) {
                this.showLoading(wholeDom, false);
                throw ex;
            }
        });
    }
    importWorkspace(filePath) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("loading");
            const workspaceSaver = new workspace_saver_1.default(filePath);
            let json = yield workspaceSaver.loadWorkspaceFile();
            let workspace = (_a = json.resources) === null || _a === void 0 ? void 0 : _a.filter((r) => r._type == "workspace")[0];
            yield this.context.data.import.raw(JSON.stringify(json));
            workspace || (workspace = {
                name: "Unknown name",
            });
            const config = yield this.storage.getConfig();
            config.workspaces[filePath] = {
                name: workspace.name,
                path: filePath,
            };
            yield this.storage.setConfig(config);
            console.log("laoded", config);
        });
    }
    showLoading(wholeDom, on) {
        wholeDom.querySelector(".overlay").style.display = on ? "flex" : "none";
    }
}
exports.ImportManager = ImportManager;
//# sourceMappingURL=import-manager.js.map