import os from "os";
import { join } from "path";
import { ImportManager } from "./import-manager";
import { Insomnia } from "./insomnia-interfaces";
import { JsonToTable } from "./json-to-table";
import ScreenHelper from "./screen-helper";
import InsomniaStorage, { IStorage } from "./storage";

export default class App {
  lastResponseJsonBody: any;

  public async exportActualWorkspace(context: Insomnia.IContext, models: Insomnia.IModels) {
    const storage = new InsomniaStorage(context);
    const workspaceConfig = await this.verifyConfig(storage, context, models.workspace.name);
    if (!workspaceConfig) {
      return;
    }
    const importManager = new ImportManager(context);
    await importManager.exportWorkspace(workspaceConfig);
  }

  public async importActualWorkspace(context: Insomnia.IContext, models: Insomnia.IModels) {
    const storage = new InsomniaStorage(context);
    const workspaceConfig = await this.verifyConfig(storage, context, models.workspace.name);
    if (!workspaceConfig) {
      return;
    }
    const importManager = new ImportManager(context);
    await importManager.importWorkspace(workspaceConfig.path);
  }

  public async showImportManager(context: Insomnia.IContext) {
    const node = await new ImportManager(context).getManagerDom();
    context.app.dialog("Import manager", node, {
      wide: true,
      tall: true,
      skinny: false,
    });
  }

  public async showDataAsTable(context: Insomnia.IContext) {
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
    });
  }

  public async processResponse(context: Insomnia.IContext): Promise<void> {
    try {
      const resp = this.bufferToJsonObj(context.response.getBody());
      this.lastResponseJsonBody = resp;
    } catch {
      // no-op
    }
  }

  private async verifyConfig(storage: InsomniaStorage, context: Insomnia.IContext, workspaceName: string): Promise<IStorage.IWorkspace> {
    const config = await storage.getConfig();
    const workspaceConfig = Object.values(config.workspaces).find((w) => w.data.name === workspaceName);
    if (workspaceConfig) {
      return workspaceConfig;
    }
    ScreenHelper.alertError(context, `Workspace ${workspaceName} not configured! Import workspace in import manager.`);
    return null;
  }

  private bufferToJsonObj(buf: Buffer): any {
    return JSON.parse(buf.toString("utf-8"));
  }
}
