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
        label: "uuSync - Export workspace",
        icon: "fa-download",
        action: async (context, models) => {
            const storage = new Storage(context);
            if (!(await verifyConfig(storage, context, models.workspace.name))) {
                return;
            }

            await storage.setLast(models.workspace.name);
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
        label: "uuSync - Import active",
        icon: "fa-upload",
        action: async (context, models) => {
            const storage = new Storage(context);
            if (!(await verifyConfig(storage, context, models.workspace.name))) {
                return;
            }

            await storage.setLast(models.workspace.name);
            const path = await storage.getPath(models.workspace.name);
            const imported = fs.readFileSync(path, "utf8");

            await context.data.import.raw(imported);
        },
    },
    {
        label: "uuSync - Import last (deleted)",
        icon: "fa-upload",
        action: async (context, models) => {
            const storage = new Storage(context);
            let lastWorkspace = await storage.getLast();
            lastWorkspace = await ScreenHelper.askLastWorkspace(context, lastWorkspace);
            if (!lastWorkspace) {
                return;
            }
            if (!(await verifyConfig(storage, context, lastWorkspace))) {
                return;
            }
            const path = await storage.getPath(lastWorkspace);
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
