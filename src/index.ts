import App from "./app";

const app = new App();

module.exports.workspaceActions = [
  {
    label: "uuSync - Export this workspace",
    icon: "download",
    action: app.exportActualWorkspace.bind(app),
  },
  {
    label: "uuSync - Import this workspace",
    icon: "upload",
    action: app.importActualWorkspace.bind(app),
  },
  {
    label: "uuSync - Import manager",
    icon: "list",
    action: app.showImportManager.bind(app),
  },
];

module.exports.responseHooks = [app.processResponse.bind(app)];
