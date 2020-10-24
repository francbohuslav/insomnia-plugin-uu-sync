const fs = require("fs");
const WorkspaceRepo = require("./WorkspaceRepo.js");
const ScreenHelper = require("./ScreenHelper.js");
/**
 *
 * @param {WorkspaceRepo} repo
 * @param {*} context
 */
const verifyRepoConfig = async (repo, context) => {
    if (await repo.isConfigured(context)) return true;

    ScreenHelper.alertError(context, "Workspace not configured! Click on 'uuSync - Configure' first.");
    return false;
};

module.exports.workspaceActions = [
    {
        label: "uuSync - Export Workspace",
        icon: "fa-download",
        action: async (context, models) => {
            const repo = new WorkspaceRepo(context);
            if (!(await verifyRepoConfig(repo, context))) {
                return;
            }

            const path = await repo.getPath();
            const oneLineJson = await context.data.export.insomnia({
                includePrivate: false,
                format: "json",
                workspace: models.workspace,
            });

            const content = JSON.parse(oneLineJson);
            const formattedJson = JSON.stringify(content, null, 2);
            fs.writeFileSync(path, formattedJson);
        },
    },
    {
        label: "uuSync - Import Workspace",
        icon: "fa-upload",
        action: async (context, models) => {
            const repo = new WorkspaceRepo(context);
            if (!(await verifyRepoConfig(repo, context))) {
                return;
            }
            const path = await repo.getPath();
            const imported = fs.readFileSync(path, "utf8");

            await context.data.import.raw(imported);
        },
    },
    {
        label: "uuSync - Configure",
        icon: "fa-cog",
        action: async (context, models) => {
            const repo = new WorkspaceRepo(context);

            const repoPath = await ScreenHelper.askRepoPath(context, {
                currentPath: await repo.getPath(),
                workspaceName: models.workspace.name,
            });
            if (repoPath == null) return;

            await repo.setPath(repoPath);
        },
    },
];
