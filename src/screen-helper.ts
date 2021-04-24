import { IInsomniaContext } from "./insomnia";

export default class ScreenHelper {
    public static async alertError(context: IInsomniaContext, message: string) {
        return await context.app.alert("Error!", message);
    }

    public static async askExistingWorkspaceFilePath(context: IInsomniaContext, options: any = {}) {
        await context.app.alert(
            "Choose Insomnia workspace file",
            `Choose target file for import/export of current workspace. Confirm rewrite if you choose existing file. Actual: ${options.currentPath}`
        );
        const path = await context.app.showSaveDialog({ defaultPath: options.workspaceName });

        return ScreenHelper.normalizePath(path);
    }

    public static async askNewWorkspaceFilePath(context: IInsomniaContext) {
        await context.app.alert("Choose Insomnia workspace file", `Choose source file of new workspace. Confirm rewrite question.`);
        const path = await context.app.showSaveDialog();
        return ScreenHelper.normalizePath(path);
    }

    public static async askLastWorkspace(context: IInsomniaContext, lastWorkspace: string) {
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

    private static normalizePath(path: string): string {
        if (path == null || path == "undefined") {
            return null;
        }
        return path;
    }
}
