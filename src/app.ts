import os from "os";
import { join } from "path";
import { ImportManager } from "./import-manager";
import { IInsomniaContext, IInsomniaModels, IStorageConfig_Workspace } from "./insomnia";
import { JsonToTable } from "./json-to-table";
import ScreenHelper from "./screen-helper";
import InsomniaStorage from "./storage";

export default class App {
  lastResponseJsonBody: any;

  // public async export(context: IInsomniaContext, models: IInsomniaModels) {
  //   const storage = new InsomniaStorage(context);
  //   if (!(await this.verifyConfig(storage, context, models.workspace.name))) {
  //     return;
  //   }
  //   await storage.setLast(models.workspace.name);
  //   const path = await storage.getPath(models.workspace.name);
  //   const oneLineJson = await context.data.export.insomnia({
  //     includePrivate: false,
  //     format: "json",
  //     workspace: models.workspace,
  //   });

  //   const normalizer = new FileNormalizer();
  //   const jsonObject = normalizer.normalizeExport(oneLineJson);
  //   const workspaceSaver = new WorkspaceSaver(path);
  //   await workspaceSaver.exportOneFile(jsonObject);
  //   await workspaceSaver.exportMultipleFiles(jsonObject);
  // }

  public async importActualWorkspace(context: IInsomniaContext, models: IInsomniaModels) {
    const storage = new InsomniaStorage(context);
    const workspaceConfig = await this.verifyConfig(storage, context, models.workspace.name);
    if (!workspaceConfig) {
      return;
    }
    const importManager = new ImportManager(context, models);
    await importManager.importWorkspace(workspaceConfig.path);
  }

  //TODO: BF: projit pak vse a zjistit jeslti se vse pouziva

  public async showImportManager(context: IInsomniaContext, models: IInsomniaModels) {
    const node = await new ImportManager(context, models).getManagerDom();
    context.app.dialog("Import manager", node, {
      wide: true,
      tall: true,
      skinny: false,
      // onHide: () => {
      //   console.log("ishiding");
      // },
    });
  }

  public async showDataAsTable(context: IInsomniaContext, models: IInsomniaModels) {
    if (!this.lastResponseJsonBody) {
      this.lastResponseJsonBody = {
        itemList: [
          {
            Message: "run some request with response.itemList first",
          },
        ],
      };
    }
    var jsonToTable = new JsonToTable();

    const whole = document.createElement("div");
    whole.style.padding = "10px";
    const link = document.createElement("button");
    link.classList.add("tag");
    link.classList.add("bg-info");
    link.style.marginBottom = "0.5em";
    link.innerText = "Save to file";
    link.addEventListener("click", async () => {
      const filePath = join(os.tmpdir(), "insomnia-response-table.html");
      await jsonToTable.saveToFile(filePath, html);
    });
    whole.appendChild(link);

    const table = document.createElement("div");
    const html = jsonToTable.getTableHtml(this.lastResponseJsonBody);
    table.innerHTML = html;
    whole.appendChild(table);

    context.app.dialog("Response as table", whole, {
      wide: true,
      tall: true,
      skinny: false,
      // onHide: () => {
      //   console.log("ishiding");
      // },
    });
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

  private async verifyConfig(storage: InsomniaStorage, context: IInsomniaContext, workspaceName: string): Promise<IStorageConfig_Workspace> {
    const config = await storage.getConfig();
    const workspaceConfig = Object.values(config.workspaces).find((w) => w.name === workspaceName);
    if (workspaceConfig) {
      return workspaceConfig;
    }
    ScreenHelper.alertError(context, `Workspace ${workspaceName} not configured! Import workspace in import manager.`);
    return null;
  }

  private bufferToJsonObj(buf: Buffer): any {
    return JSON.parse(buf.toString("utf-8"));
  }
  private jsonObjToBuffer(obj: any): Buffer {
    return Buffer.from(JSON.stringify(obj), "utf-8");
  }
}
