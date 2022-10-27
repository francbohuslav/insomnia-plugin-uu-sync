import { IInsomniaContext, IInsomniaFileWorkspace, IInsomniaModels, IStorageConfig, IStorageConfig_Workspace } from "./insomnia";
import ScreenHelper from "./screen-helper";
import InsomniaStorage from "./storage";
import WorkspaceSaver from "./workspace-saver";

export class ImportManager {
  storage: InsomniaStorage;

  constructor(private context: IInsomniaContext, private models: IInsomniaModels) {
    this.storage = new InsomniaStorage(this.context);
  }

  async getManagerDom(): Promise<HTMLElement> {
    const config = await this.storage.getConfig();
    const wholeDom = document.createElement("div");
    wholeDom.classList.add("import-manager");
    wholeDom.style.padding = "10px";
    wholeDom.innerHTML = `
    <style>
    .import-manager{
      padding: 10px;
      position:relative;
    }
    .import-manager td, .import-manager th {
      padding: 4px 8px;
    }
    .import-manager .buttons{
      margin-bottom: 0.5em;
    }
    .import-manager .overlay{
      background: rgb(255,255,255,0.7);
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: none;
      justify-content: center;
      align-items: center;
      font-size: 30px;
      min-height: 200px;
    }
    </style>
    <div class="buttons"></div>
    <table><thead></thead><tbody></tbody></table>`;

    const buttons = wholeDom.querySelector(".buttons");
    const newImport = document.createElement("button");
    newImport.classList.add("tag");
    newImport.classList.add("bg-info");
    newImport.innerText = "Add new workspace";
    newImport.addEventListener("click", () => this.newImportWizard(wholeDom));
    buttons.appendChild(newImport);
    this.refreshGui(config, wholeDom);
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.innerText = "Working, wait...";
    wholeDom.appendChild(overlay);
    return wholeDom;
  }

  private refreshGui(config: IStorageConfig, wholeDom: HTMLDivElement) {
    const tableHead = wholeDom.querySelector("table > thead");
    tableHead.innerHTML = `<tr><th>Workspace</th><th>Path</th><th>Actions</th></tr>`;
    const tableBody = wholeDom.querySelector("table > tbody");
    tableBody.innerHTML = "";
    const workspaces = Object.values(config.workspaces);
    workspaces.sort((a, b) => a.name.localeCompare(b.name));
    workspaces.forEach((workspace) => {
      const tr = document.createElement("tr");
      let td = document.createElement("td");
      td.innerHTML = `<strong>${workspace.name}</strong>`;
      tr.appendChild(td);

      td = document.createElement("td");
      td.innerText = workspace.path;
      tr.appendChild(td);

      td = document.createElement("td");
      let button = document.createElement("button");
      button.classList.add("tag");
      button.classList.add("bg-info");
      button.innerText = "Import";
      button.addEventListener("click", () => this.importWorkspaceByGui(workspace.path, wholeDom));
      td.appendChild(button);

      button = document.createElement("button");
      button.classList.add("tag");
      button.classList.add("bg-info");
      button.innerText = "Delete";
      button.addEventListener("click", () => this.deleteWorkspace(workspace, wholeDom));
      td.appendChild(button);
      tr.appendChild(td);

      tableBody.appendChild(tr);
    });
  }

  private async newImportWizard(wholeDom: HTMLDivElement) {
    const filePath = await ScreenHelper.askExistingWorkspaceFilePath(this.context);
    if (filePath == null) {
      return;
    }
    await this.importWorkspaceByGui(filePath, wholeDom);
  }

  private async importWorkspaceByGui(filePath: string, wholeDom: HTMLDivElement) {
    try {
      this.showLoading(wholeDom, true);
      await this.importWorkspace(filePath);
      const config = await this.storage.getConfig();
      this.refreshGui(config, wholeDom);
      this.showLoading(wholeDom, false);
    } catch (ex) {
      this.showLoading(wholeDom, false);
      throw ex;
    }
  }

  private async deleteWorkspace(workspace: IStorageConfig_Workspace, wholeDom: HTMLDivElement) {
    try {
      let workSpaceName: string;
      try {
        workSpaceName = await this.context.app.prompt("Do you really want to remove this workspace from list? Workspace will not be delete from Insomnia.", {
          cancelable: true,
          defaultValue: workspace.name,
          submitName: "Yes, delete it",
          label: "Workspace",
        });
      } catch (ex) {
        console.error("Dialog canceled", ex);
      }
      if (!workSpaceName) {
        return;
      }

      const config = await this.storage.getConfig();
      workspace = Object.values(config.workspaces).find((w) => w.name === workSpaceName.trim());
      this.showLoading(wholeDom, true);
      delete config.workspaces[workspace.path];
      await this.storage.setConfig(config);
      this.refreshGui(config, wholeDom);
      this.showLoading(wholeDom, false);
    } catch (ex) {
      this.showLoading(wholeDom, false);
      throw ex;
    }
  }

  public async importWorkspace(filePath: string): Promise<void> {
    console.log("loading");
    const workspaceSaver = new WorkspaceSaver(filePath);
    let json = await workspaceSaver.loadWorkspaceFile();
    let workspace = json.resources?.filter((r) => r._type == "workspace")[0] as IInsomniaFileWorkspace;
    await this.context.data.import.raw(JSON.stringify(json));
    workspace ||= {
      name: "Unknown name",
    };
    const config = await this.storage.getConfig();
    config.workspaces[filePath] = {
      name: workspace.name,
      path: filePath,
    };
    await this.storage.setConfig(config);
    console.log("laoded", config);
  }

  private showLoading(wholeDom: HTMLDivElement, on: boolean): void {
    (wholeDom.querySelector(".overlay") as HTMLDivElement).style.display = on ? "flex" : "none";
  }
}
