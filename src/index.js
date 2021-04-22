const fs = require("fs");
const Storage = require("./storage.js");
const ScreenHelper = require("./screen-helper.js");
const FileNormalizer = require("./file-normalizer.js");
const WorkspaceSaver = require("./workspace-saver.js");
const normalizer = new FileNormalizer();

const connectWithFileStr = "uuSync - Connect with file";
/**
 *
 * @param {Storage} storage
 * @param {*} context
 */
const verifyConfig = async (storage, context, workspaceName) => {
    if (await storage.isConfigured(workspaceName)) return true;

    ScreenHelper.alertError(context, `Workspace not configured! Click on '${connectWithFileStr}' first.`);
    return false;
};

module.exports.workspaceActions = [
    {
        label: "uuSync - Export",
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

            const jsonObject = normalizer.normalizeExport(oneLineJson);
            const workspaceSaver = new WorkspaceSaver(path);
            await workspaceSaver.exportOneFile(jsonObject);
            await workspaceSaver.exportMultipleFiles(jsonObject);
        },
    },
    {
        label: "uuSync - Import",
        icon: "fa-upload",
        action: async (context, models) => {
            const storage = new Storage(context);
            let path = null;
            if (await verifyConfig(storage, context, models.workspace.name)) {
                path = await storage.getPath(models.workspace.name);
            } else {
                path = await ScreenHelper.askNewWorkspaceFilePath(context);
            }
            if (!path) {
                return;
            }

            const workspaceSaver = new WorkspaceSaver(path);
            let json = await workspaceSaver.importMultipleFiles();
            if (json.resources) {
                const workSpace = json.resources.filter((r) => r._type == "workspace")[0];
                if (workSpace) {
                    await storage.setLast(workSpace.name);
                    await storage.setPath(workSpace.name, path);
                }
            }
            await context.data.import.raw(JSON.stringify(json));
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
            const workspaceSaver = new WorkspaceSaver(path);
            let json = await workspaceSaver.importMultipleFiles();
            await context.data.import.raw(JSON.stringify(json));
        },
    },
    {
        label: connectWithFileStr,
        icon: "fa-cog",
        action: async (context, models) => {
            const storage = new Storage(context);
            const filePath = await ScreenHelper.askExistingWorkspaceFilePath(context, {
                currentPath: await storage.getPath(models.workspace.name),
                workspaceName: "insomnia-workspace.json",
            });
            if (filePath == null) {
                return;
            }
            await storage.setPath(models.workspace.name, filePath);
        },
    },
];
