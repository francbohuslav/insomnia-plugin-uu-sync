import App from "./app";

const app = new App();

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
