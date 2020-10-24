class ScreenHelper {
    static async alertError(context, message) {
        return await context.app.alert("Error!", message);
    }

    static async askRepoPath(context, options = {}) {
        await context.app.alert("Choose insomnia-workspace", `Choose target file for import/export of workspace. Actual: ${options.currentPath}`);
        const path = await context.app.showSaveDialog({ defaultPath: options.workspaceName });

        return normalizePath(path);
    }
}

const normalizePath = (path) => {
    if (path == null || path == "undefined") return null;
    return path;
};

module.exports = ScreenHelper;
