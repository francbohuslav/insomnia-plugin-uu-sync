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
const react_1 = __importDefault(require("react"));
const client_1 = require("react-dom/client");
const app_error_1 = require("./app-error");
const page_1 = require("./components/page");
const file_normalizer_1 = __importDefault(require("./file-normalizer"));
const insomnia_file_1 = require("./insomnia-file");
const screen_helper_1 = __importDefault(require("./screen-helper"));
const storage_1 = __importDefault(require("./storage"));
const workspace_saver_1 = __importDefault(require("./workspace-saver"));
class ImportManager {
    constructor(context) {
        this.context = context;
        this.storage = new storage_1.default(this.context);
    }
    getManagerDom() {
        return __awaiter(this, void 0, void 0, function* () {
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
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30px;
      min-height: 200px;
    }
    </style>
    `;
            const reactDom = document.createElement("div");
            wholeDom.appendChild(reactDom);
            const root = client_1.createRoot(reactDom);
            root.render(react_1.default.createElement(page_1.Page, { importer: this, context: this.context }));
            return wholeDom;
        });
    }
    exportAll(workspaces, setOverlay) {
        return screen_helper_1.default.catchErrors(this.context, () => __awaiter(this, void 0, void 0, function* () {
            setOverlay(true, "0%");
            let counter = 0;
            yield Promise.all([...workspaces].map((workspace) => this.exportWorkspace(workspace).then(() => {
                counter++;
                setOverlay(true, ((counter / workspaces.length) * 100).toFixed(0) + "%");
            })));
        }), () => setOverlay());
    }
    importAll(workspaces, setOverlay) {
        return screen_helper_1.default.catchErrors(this.context, () => __awaiter(this, void 0, void 0, function* () {
            for (const workspace of workspaces) {
                setOverlay(true, workspace.data.name);
                yield this.importWorkspace(workspace.path);
            }
        }), () => {
            setOverlay();
        });
    }
    newImportWizard(setOverlay) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = yield screen_helper_1.default.askNewWorkspaceFilePath(this.context);
            if (filePath == null) {
                return;
            }
            yield this.importWorkspaceByGui(filePath, setOverlay);
        });
    }
    importWorkspaceByGui(filePath, setOverlay, progress) {
        return screen_helper_1.default.catchErrors(this.context, () => __awaiter(this, void 0, void 0, function* () {
            setOverlay(true, progress);
            yield this.importWorkspace(filePath);
        }), () => {
            setOverlay();
        });
    }
    exportWorkspaceByGui(workspace, setOverlay, progress) {
        return screen_helper_1.default.catchErrors(this.context, () => __awaiter(this, void 0, void 0, function* () {
            setOverlay(true, progress);
            yield this.exportWorkspace(workspace);
        }), () => {
            setOverlay();
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
    deleteWorkspaceByGui(workspace, setOverlay) {
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
                setOverlay(true);
                delete config.workspaces[workspace.path];
                yield this.storage.setConfig(config);
            }), () => {
                setOverlay();
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
            this.checkWorkspaceUniqueness(config, workspace, filePath);
            yield this.context.data.import.raw(JSON.stringify(json));
            config.workspaces[filePath] = {
                path: filePath,
                data: workspace,
            };
            yield this.storage.setConfig(config);
        });
    }
    checkWorkspaceUniqueness(config, workspace, filePath) {
        const existingWorkspace = Object.values(config.workspaces).find((w) => w.data._id === workspace._id && w.path !== filePath);
        if (existingWorkspace) {
            throw new app_error_1.AppError(`This workspace already exists in different path ${existingWorkspace.path}.\nImport canceled, to avoid unexpected result. Different workspaces must use unique id. 
      If some workspace is based of existing one, than must be duplicated by Insomnia to have different unique id.\nIf you really want import this workspace, thus delete existing one from Insomnia and from this import manager.`);
        }
    }
}
exports.ImportManager = ImportManager;
//# sourceMappingURL=import-manager.js.map