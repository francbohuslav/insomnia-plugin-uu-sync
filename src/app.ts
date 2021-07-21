import FileNormalizer from "./file-normalizer";
import { IInsomniaContext, IInsomniaModels } from "./insomnia";
import ScreenHelper from "./screen-helper";
import WorkspaceSaver from "./workspace-saver";
import InsomniaStorage from "./storage";

export default class App {
    public async export(context: IInsomniaContext, models: IInsomniaModels) {
        const storage = new InsomniaStorage(context);
        if (!(await this.verifyConfig(storage, context, models.workspace.name))) {
            return;
        }
        await storage.setLast(models.workspace.name);
        const path = await storage.getPath(models.workspace.name);
        const oneLineJson = await context.data.export.insomnia({
            includePrivate: false,
            format: "json",
            workspace: models.workspace,
        });

        const normalizer = new FileNormalizer();
        const jsonObject = normalizer.normalizeExport(oneLineJson);
        const workspaceSaver = new WorkspaceSaver(path);
        await workspaceSaver.exportOneFile(jsonObject);
        await workspaceSaver.exportMultipleFiles(jsonObject);
    }

    public async import(context: IInsomniaContext, models: IInsomniaModels) {
        const storage = new InsomniaStorage(context);
        let path: string = null;
        if (await this.verifyConfig(storage, context, models.workspace.name)) {
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
    }

    public async importLast(context: IInsomniaContext, models: IInsomniaModels) {
        const storage = new InsomniaStorage(context);
        let lastWorkspace = await storage.getLast();
        lastWorkspace = await ScreenHelper.askLastWorkspace(context, lastWorkspace);
        if (!lastWorkspace) {
            return;
        }
        if (!(await this.verifyConfig(storage, context, lastWorkspace))) {
            return;
        }
        const path = await storage.getPath(lastWorkspace);
        const workspaceSaver = new WorkspaceSaver(path);
        let json = await workspaceSaver.importMultipleFiles();
        await context.data.import.raw(JSON.stringify(json));
    }

    public async connectWithFile(context: IInsomniaContext, models: IInsomniaModels) {
        const storage = new InsomniaStorage(context);
        const filePath = await ScreenHelper.askExistingWorkspaceFilePath(context, {
            currentPath: await storage.getPath(models.workspace.name),
            workspaceName: "insomnia-workspace.json",
        });
        if (filePath == null) {
            return;
        }
        await storage.setPath(models.workspace.name, filePath);
        await storage.setLast(models.workspace.name);
    }

    public getLabelString(): string {
        return "uuSync - Connect with file";
    }

    private async verifyConfig(storage: InsomniaStorage, context: IInsomniaContext, workspaceName: string) {
        if (await storage.isConfigured(workspaceName)) {
            return true;
        }
        ScreenHelper.alertError(context, `Workspace not configured! Click on '${this.getLabelString()}' first.`);
        return false;
    }
}
