import FileNormalizer from "./file-normalizer";
import { IInsomniaContext, IInsomniaModels } from "./insomnia";
import ScreenHelper from "./screen-helper";
import WorkspaceSaver from "./workspace-saver";
import InsomniaStorage from "./storage";
import fs from "fs/promises";
import os from "os";
import { join } from "path";
import { JsonToTable } from "./json-to-table";

export default class App {
  lastResponseJsonBody: any;

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

  public async showDataAsTable(context: IInsomniaContext, models: IInsomniaModels) {
    console.log(context);
    // const div = document.createElement("div");
    // div.innerHTML = "nejaky content <b>tucny</b>";
    // context.app.dialog("Hele, co jde", div, {
    //   wide: true,
    //   tall: true,
    //   skinny: true,
    //   onHide: () => {
    //     console.log("ishiding");
    //   },
    // });
    if (this.lastResponseJsonBody) {
      const filePath = join(os.tmpdir(), "insomnia-response-table.html");
      var jsonToTable = new JsonToTable();
      await jsonToTable.saveToFile(filePath, this.lastResponseJsonBody);
    }
  }

  public async processResponse(context: IInsomniaContext, models: IInsomniaModels): Promise<void> {
    console.log(context, models);

    try {
      const resp = this.bufferToJsonObj(context.response.getBody());
      this.lastResponseJsonBody = resp;
    } catch {
      // no-op
    }
  }

  public getConnectionFileLabelString(): string {
    return "uuSync - Connect with file";
  }

  private async verifyConfig(storage: InsomniaStorage, context: IInsomniaContext, workspaceName: string) {
    if (await storage.isConfigured(workspaceName)) {
      return true;
    }
    ScreenHelper.alertError(context, `Workspace not configured! Click on '${this.getConnectionFileLabelString()}' first.`);
    return false;
  }

  private bufferToJsonObj(buf: Buffer): any {
    return JSON.parse(buf.toString("utf-8"));
  }
  private jsonObjToBuffer(obj: any): Buffer {
    return Buffer.from(JSON.stringify(obj), "utf-8");
  }
}
