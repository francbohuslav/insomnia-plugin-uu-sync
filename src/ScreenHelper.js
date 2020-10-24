class ScreenHelper {
    static async alertError(context, message) {
        return await context.app.alert("Error!", message);
    }

    static async askExistingWorkspaceFilePath(context, options = {}) {
        await context.app.alert(
            "Choose Insomnia workspace file",
            `Choose target file for import/export of current workspace. Confirm rewrite if you choose existing file. Actual: ${options.currentPath}`
        );
        const path = await context.app.showSaveDialog({ defaultPath: options.workspaceName });

        return normalizePath(path);
    }

    static async askNewWorkspaceFilePath(context) {
        await context.app.alert("Choose Insomnia workspace file", `Choose source file of new workspace. Confirm rewrite question.`);
        const path = await context.app.showSaveDialog();
        return normalizePath(path);
    }

    static async askLastWorkspace(context, lastWorkspace) {
        try {
            return await context.app.prompt("Workspace to import", {
                label: "Specify name of workspace to import. Can be also some used but removed from Insomnia.",
                defaultValue: lastWorkspace || "",
                submitName: "Import",
                cancelable: true,
            });
        } catch (error) {
            return null;
        }
    }
}

const normalizePath = (path) => {
    if (path == null || path == "undefined") return null;
    return path;
};

module.exports = ScreenHelper;
