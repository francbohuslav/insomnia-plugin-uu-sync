const fs = require("fs");
const Storage = require("./Storage.js");
const ScreenHelper = require("./ScreenHelper.js");
const FileNormalizer = require("./FileNormalizer.js");
const normalizer = new FileNormalizer();

/**
 *
 * @param {Storage} storage
 * @param {*} context
 */
const verifyConfig = async (storage, context, workspaceName) => {
    if (await storage.isConfigured(workspaceName)) return true;

    ScreenHelper.alertError(context, "Workspace not configured! Click on 'uuSync - Configure' first.");
    return false;
};

module.exports.workspaceActions = [
    {
        label: "uuSync - Export Workspace",
        icon: "fa-download",
        action: async (context, models) => {
            const storage = new Storage(context);
            if (!(await verifyConfig(storage, context, models.workspace.name))) {
                return;
            }

            const path = await storage.getPath(models.workspace.name);
            const oneLineJson = await context.data.export.insomnia({
                includePrivate: false,
                format: "json",
                workspace: models.workspace,
            });

            const formattedJson = normalizer.normalize(oneLineJson);
            fs.writeFileSync(path, formattedJson);
        },
    },
    {
        label: "uuSync - Import Workspace",
        icon: "fa-upload",
        action: async (context, models) => {
            const storage = new Storage(context);
            if (!(await verifyConfig(storage, context, models.workspace.name))) {
                return;
            }
            const path = await storage.getPath(models.workspace.name);
            const imported = fs.readFileSync(path, "utf8");

            await context.data.import.raw(imported);
        },
    },
    {
        label: "uuSync - Configure",
        icon: "fa-cog",
        action: async (context, models) => {
            const storage = new Storage(context);

            const filePath = await ScreenHelper.askFilePath(context, {
                currentPath: await storage.getPath(models.workspace.name),
                workspaceName: models.workspace.name,
            });
            if (filePath == null) return;

            await storage.setPath(models.workspace.name, filePath);
        },
    },
];
