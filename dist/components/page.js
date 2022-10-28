"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.Page = void 0;
const react_1 = __importStar(require("react"));
const storage_1 = __importDefault(require("../storage"));
const Page = (props) => {
    const storage = new storage_1.default(props.context);
    const [reload, setReload] = react_1.useState(0);
    const [config, setConfig] = react_1.useState();
    const [overlay, setOverlay] = react_1.useState({
        visible: false,
        progress: "",
    });
    react_1.useEffect(() => {
        storage.getConfig().then(setConfig);
    }, [reload]);
    const setProgress = (visible, progress) => {
        setOverlay((overlay) => (Object.assign(Object.assign({}, overlay), { visible, progress })));
    };
    const withReload = (action) => __awaiter(void 0, void 0, void 0, function* () {
        yield action();
        setReload((reload) => reload + 1);
    });
    const workspaces = (config === null || config === void 0 ? void 0 : config.workspaces) ? Object.values(config.workspaces) : [];
    workspaces.sort((a, b) => a.data.name.localeCompare(b.data.name));
    const commonPath = workspaces.length > 0 ? getCommonPath(workspaces) : "";
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("div", { className: "buttons" },
            react_1.default.createElement("button", { className: "tag bg-info", onClick: () => withReload(() => props.importer.newImportWizard(setProgress)) }, "Add new workspace"),
            workspaces.length > 0 && (react_1.default.createElement("table", null,
                react_1.default.createElement("thead", null,
                    react_1.default.createElement("tr", null,
                        react_1.default.createElement("th", null, "Workspace"),
                        react_1.default.createElement("th", null, "Path"),
                        react_1.default.createElement("th", null, "Actions"))),
                react_1.default.createElement("tbody", null,
                    react_1.default.createElement("tr", null,
                        react_1.default.createElement("td", null,
                            workspaces.length,
                            "x"),
                        react_1.default.createElement("td", null, commonPath ? commonPath + "..." : ""),
                        react_1.default.createElement("td", null,
                            react_1.default.createElement("button", { className: "tag bg-info", onClick: () => withReload(() => props.importer.importAll(workspaces, setProgress)) }, "Import all"),
                            react_1.default.createElement("button", { className: "tag bg-info", onClick: () => withReload(() => props.importer.exportAll(workspaces, setProgress)) }, "Export all"))),
                    workspaces.map((workspace, i) => (react_1.default.createElement("tr", { key: i },
                        react_1.default.createElement("td", null,
                            react_1.default.createElement("strong", null, workspace.data.name)),
                        react_1.default.createElement("td", null,
                            commonPath.length > 0 ? "..." : "",
                            workspace.path.slice(commonPath.length)),
                        react_1.default.createElement("td", null,
                            react_1.default.createElement("button", { className: "tag bg-info", onClick: () => withReload(() => props.importer.importWorkspaceByGui(workspace.path, setProgress)) }, "Import"),
                            react_1.default.createElement("button", { className: "tag bg-info", onClick: () => withReload(() => props.importer.exportWorkspaceByGui(workspace, setProgress)) }, "Export"),
                            react_1.default.createElement("button", { className: "tag bg-danger", onClick: () => withReload(() => props.importer.deleteWorkspaceByGui(workspace, setProgress)) }, "Delete"))))))))),
        overlay.visible && react_1.default.createElement("div", { className: "overlay" },
            "Working, wait... ",
            overlay.progress)));
};
exports.Page = Page;
function getCommonPath(workspaces) {
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
//# sourceMappingURL=page.js.map