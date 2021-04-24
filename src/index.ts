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
        label: "uuSync - Import last (deleted)",
        icon: "fa-upload",
        action: app.importLast.bind(app),
    },
    {
        label: app.getLabelString(),
        icon: "fa-cog",
        action: app.connectWithFile.bind(app),
    },
];
