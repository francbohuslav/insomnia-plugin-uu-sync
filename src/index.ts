import App from "./app";

const app = new App();

module.exports.workspaceActions = [
  {
    label: "uuSync - Export this workspace",
    icon: "fa-download",
    action: app.exportActualWorkspace.bind(app),
  },
  {
    label: "uuSync - Import this workspace",
    icon: "fa-upload",
    action: app.importActualWorkspace.bind(app),
  },
  {
    label: "uuSync - Import manager",
    icon: "fa-list",
    action: app.showImportManager.bind(app),
  },
];

module.exports.responseHooks = [app.processResponse.bind(app)];
