"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const app = new app_1.default();
module.exports.workspaceActions = [
    {
        label: "uuSync - Export",
        icon: "fa-download",
        action: app.export.bind(app),
    },
    {
        label: "uuSync - Import",
        icon: "fa-upload",
        action: app.import.bind(app),
    },
    {
        label: "uuSync - Import manager",
        icon: "fa-list",
        action: app.showImportManager.bind(app),
    },
    {
        label: "Show response as table",
        icon: "fa-table",
        action: app.showDataAsTable.bind(app),
    },
];
module.exports.responseHooks = [app.processResponse.bind(app)];
//# sourceMappingURL=index.js.map