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
    const [config, setConfig] = react_1.useState();
    const [activeTabId, setActiveTabId] = react_1.useState(undefined);
    const [overlay, setOverlay] = react_1.useState({
        visible: false,
        progress: "",
    });
    react_1.useEffect(() => {
        reloadConfig();
    }, []);
    const setProgress = (visible, progress) => {
        setOverlay((overlay) => (Object.assign(Object.assign({}, overlay), { visible, progress })));
    };
    const withReload = (action) => __awaiter(void 0, void 0, void 0, function* () {
        yield action();
        yield reloadConfig();
    });
    const reloadConfig = () => __awaiter(void 0, void 0, void 0, function* () {
        const config = yield storage.getConfig();
        setConfig(config);
        if (activeTabId === undefined) {
            setActiveTabId(config.tabs[0].id);
        }
    });
    const showRenameTabDialog = (tab) => __awaiter(void 0, void 0, void 0, function* () {
        let tabName = "";
        try {
            tabName = yield props.context.app.prompt("Name of group. To remove group with its workspaces, delete name and confirm.", {
                cancelable: true,
                defaultValue: tab.name,
                submitName: "Ok",
                label: "Group name",
            });
        }
        catch (ex) {
            // canceled
            return;
        }
        if (!tabName) {
            // Delete tab
            if (config.tabs.length === 1) {
                props.context.app.alert("Error", "Sorry bro, but last group can not be deleted.");
            }
            else {
                config.tabs.splice(config.tabs.findIndex((t) => t.id === tab.id), 1);
                const newWorkspaces = {};
                Object.values(config.workspaces)
                    .filter((w) => w.tabId !== tab.id)
                    .forEach((w) => {
                    newWorkspaces[w.path] = w;
                });
                config.workspaces = newWorkspaces;
                yield storage.setConfig(config);
                yield reloadConfig();
                setActiveTabId(config.tabs[0].id);
            }
        }
        else {
            tab.name = tabName;
            yield storage.setConfig(config);
            yield reloadConfig();
        }
    });
    const showCreateTabDialog = () => __awaiter(void 0, void 0, void 0, function* () {
        let tabName = "";
        try {
            tabName = yield props.context.app.prompt("Create new group", {
                cancelable: true,
                defaultValue: "",
                submitName: "Create group",
                label: "Group name",
            });
        }
        catch (ex) {
            // canceled
            return;
        }
        if (tabName == "") {
            return;
        }
        const newTab = {
            id: Date.now(),
            name: tabName,
        };
        config.tabs.push(newTab);
        yield storage.setConfig(config);
        yield reloadConfig();
        setActiveTabId(newTab.id);
    });
    const workspaces = (config === null || config === void 0 ? void 0 : config.workspaces) ? Object.values(config.workspaces).filter((w) => w.tabId === activeTabId) : [];
    workspaces.sort((a, b) => a.data.name.localeCompare(b.data.name));
    const commonPath = workspaces.length > 1 ? getCommonPath(workspaces) : "";
    return (react_1.default.createElement("div", null,
        activeTabId > 0 && (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "tabs" },
                config.tabs.map((tab) => (react_1.default.createElement("button", { key: tab.id, className: "tab tag " + (tab.id === activeTabId ? "bg-info" : "bg-default"), title: "Double click to edit", onClick: () => setActiveTabId(tab.id), onDoubleClick: () => showRenameTabDialog(tab) }, tab.name))),
                react_1.default.createElement("button", { className: "tab tag bg-default", title: "Create new group", onClick: () => showCreateTabDialog() }, "+")),
            react_1.default.createElement("table", null,
                react_1.default.createElement("thead", null,
                    react_1.default.createElement("tr", null,
                        react_1.default.createElement("th", null, "Workspace"),
                        react_1.default.createElement("th", null, "Path"),
                        react_1.default.createElement("th", null, "Actions"))),
                react_1.default.createElement("tbody", null,
                    workspaces.length > 1 && (react_1.default.createElement("tr", null,
                        react_1.default.createElement("td", null,
                            workspaces.length,
                            "x"),
                        react_1.default.createElement("td", null, commonPath ? commonPath + "..." : ""),
                        react_1.default.createElement("td", null,
                            react_1.default.createElement("button", { className: "tag bg-info", onClick: () => withReload(() => props.importer.importAll(workspaces, setProgress, activeTabId)) }, "Import all"),
                            react_1.default.createElement("button", { className: "tag bg-info", onClick: () => withReload(() => props.importer.exportAll(workspaces, setProgress)) }, "Export all")))),
                    workspaces.map((workspace, i) => (react_1.default.createElement("tr", { key: i },
                        react_1.default.createElement("td", null,
                            react_1.default.createElement("strong", null, workspace.data.name)),
                        react_1.default.createElement("td", null,
                            commonPath.length > 0 ? "..." : "",
                            workspace.path.slice(commonPath.length)),
                        react_1.default.createElement("td", null,
                            react_1.default.createElement("button", { className: "tag bg-info", onClick: () => withReload(() => props.importer.importWorkspaceByGui(workspace.path, setProgress, activeTabId)) }, "Import"),
                            react_1.default.createElement("button", { className: "tag bg-info", onClick: () => withReload(() => props.importer.exportWorkspaceByGui(workspace, setProgress)) }, "Export"),
                            react_1.default.createElement("button", { className: "tag bg-danger", onClick: () => withReload(() => props.importer.deleteWorkspaceByGui(workspace, setProgress)) }, "Delete"))))))),
            react_1.default.createElement("button", { className: "tag bg-info", style: { marginTop: "1em", marginLeft: "20px" }, onClick: () => withReload(() => props.importer.newImportWizard(setProgress, activeTabId)) }, "Add new workspace"))),
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