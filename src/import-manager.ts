import { AppError } from "./app-error";
import FileNormalizer from "./file-normalizer";
import { InsomniaFile } from "./insomnia-file";
import { Insomnia } from "./insomnia-interfaces";
import ScreenHelper from "./screen-helper";
import InsomniaStorage, { IStorage } from "./storage";
import WorkspaceSaver from "./workspace-saver";

export class ImportManager {
  storage: InsomniaStorage;

  constructor(private context: Insomnia.IContext, private models: Insomnia.IModels) {
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
      padding: 4px 20px;
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
    wholeDom.appendChild(overlay);
    return wholeDom;
  }

  private refreshGui(config: IStorage.IConfig, wholeDom: HTMLDivElement) {
    const tableHead = wholeDom.querySelector("table > thead");
    tableHead.innerHTML = `<tr><th>Workspace</th><th>Path</th><th>Actions</th></tr>`;
    const tableBody = wholeDom.querySelector("table > tbody");
    tableBody.innerHTML = "";
    const workspaces = Object.values(config.workspaces);

    const tr = document.createElement("tr");
    let td = document.createElement("td");
    td.innerHTML = `${workspaces.length}x`;
    tr.appendChild(td);

    td = document.createElement("td");
    const commonPath = this.getCommonPath(workspaces);
    td.innerHTML = commonPath ? commonPath + "..." : "";
    tr.appendChild(td);

    td = document.createElement("td");
    let button = document.createElement("button");
    button.classList.add("tag");
    button.classList.add("bg-info");
    button.innerText = "Import all";
    button.addEventListener("click", async () => {
      ScreenHelper.catchErrors(
        this.context,
        async () => {
          for (const workspace of workspaces) {
            this.showLoading(wholeDom, true, workspace.data.name);
            await this.importWorkspace(workspace.path);
          }
          const config = await this.storage.getConfig();
          this.refreshGui(config, wholeDom);
        },
        () => {
          this.showLoading(wholeDom, false);
        }
      );
    });
    td.appendChild(button);

    button = document.createElement("button");
    button.classList.add("tag");
    button.classList.add("bg-info");
    button.innerText = "Export all";
    button.addEventListener("click", () => {
      ScreenHelper.catchErrors(
        this.context,
        async () => {
          this.showLoading(wholeDom, true, "0%");
          let counter = 0;
          const config = await this.storage.getConfig();
          await Promise.all(
            [...workspaces].map((workspace) =>
              this.exportWorkspace(workspace).then(() => {
                counter++;
                this.showLoading(wholeDom, true, ((counter / workspaces.length) * 100).toFixed(0) + "%");
              })
            )
          );
          this.refreshGui(config, wholeDom);
        },
        () => this.showLoading(wholeDom, false)
      );
    });
    td.appendChild(button);
    tr.appendChild(td);

    tableBody.appendChild(tr);

    workspaces.sort((a, b) => a.data.name.localeCompare(b.data.name));
    workspaces.forEach((workspace) => {
      const tr = document.createElement("tr");
      let td = document.createElement("td");
      td.innerHTML = `<strong>${workspace.data.name}</strong>`;
      tr.appendChild(td);

      td = document.createElement("td");
      td.innerText = (commonPath.length > 0 ? "..." : "") + workspace.path.slice(commonPath.length);
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
      button.innerText = "Export";
      button.addEventListener("click", () => this.exportWorkspaceByGui(workspace, wholeDom));
      td.appendChild(button);

      button = document.createElement("button");
      button.classList.add("tag");
      button.classList.add("bg-danger");
      button.innerText = "Delete";
      button.addEventListener("click", () => this.deleteWorkspaceByGui(workspace, wholeDom));
      td.appendChild(button);
      tr.appendChild(td);

      tableBody.appendChild(tr);
    });
  }

  private async newImportWizard(wholeDom: HTMLDivElement) {
    const filePath = await ScreenHelper.askNewWorkspaceFilePath(this.context);
    if (filePath == null) {
      return;
    }
    await this.importWorkspaceByGui(filePath, wholeDom);
  }

  private importWorkspaceByGui(filePath: string, wholeDom: HTMLDivElement, progress?: string) {
    return ScreenHelper.catchErrors(
      this.context,
      async () => {
        this.showLoading(wholeDom, true, progress);
        await this.importWorkspace(filePath);
        const config = await this.storage.getConfig();
        this.refreshGui(config, wholeDom);
      },
      () => {
        this.showLoading(wholeDom, false);
      }
    );
  }

  private exportWorkspaceByGui(workspace: IStorage.IWorkspace, wholeDom: HTMLDivElement, progress?: string) {
    return ScreenHelper.catchErrors(
      this.context,
      async () => {
        this.showLoading(wholeDom, true, progress);
        const config = await this.storage.getConfig();
        await this.exportWorkspace(workspace);
        this.refreshGui(config, wholeDom);
      },
      () => {
        this.showLoading(wholeDom, false);
      }
    );
  }

  public async exportWorkspace(workspaceConfig: IStorage.IWorkspace) {
    const oneLineJson = await this.context.data.export.insomnia({
      includePrivate: false,
      format: "json",
      workspace: {
        _id: workspaceConfig.data._id,
        created: workspaceConfig.data.created,
        description: workspaceConfig.data.description,
        modified: workspaceConfig.data.modified,
        name: workspaceConfig.data.name,
        parentId: workspaceConfig.data.parentId,
        scope: workspaceConfig.data.scope,
        // This is only difference
        type: workspaceConfig.data._type,
      },
    });
    const normalizer = new FileNormalizer();
    const jsonObject = normalizer.normalizeExport(oneLineJson);
    const workspaceSaver = new WorkspaceSaver(workspaceConfig.path);
    await workspaceSaver.exportOneFile(jsonObject);
    await workspaceSaver.exportMultipleFiles(jsonObject);
  }

  private async deleteWorkspaceByGui(workspace: IStorage.IWorkspace, wholeDom: HTMLDivElement) {
    return ScreenHelper.catchErrors(
      this.context,
      async () => {
        let workSpaceName: string;
        try {
          workSpaceName = await this.context.app.prompt("Do you really want to remove this workspace from list? Workspace will not be delete from Insomnia.", {
            cancelable: true,
            defaultValue: workspace.data.name,
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
        workspace = Object.values(config.workspaces).find((w) => w.data.name === workSpaceName.trim());
        this.showLoading(wholeDom, true);
        delete config.workspaces[workspace.path];
        await this.storage.setConfig(config);
        this.refreshGui(config, wholeDom);
      },
      () => {
        this.showLoading(wholeDom, false);
      }
    );
  }

  public async importWorkspace(filePath: string): Promise<void> {
    const workspaceSaver = new WorkspaceSaver(filePath);
    let json = await workspaceSaver.loadWorkspaceFile();
    let workspace: InsomniaFile.IWorkspaceResource | undefined = json.resources?.filter((r) => InsomniaFile.isWorkspaceResource(r))[0] as any;
    const config = await this.storage.getConfig();
    this.checkWorkspaceUniqueness(config, workspace);
    await this.context.data.import.raw(JSON.stringify(json));
    config.workspaces[filePath] = {
      path: filePath,
      data: workspace,
    };
    await this.storage.setConfig(config);
  }

  private checkWorkspaceUniqueness(config: IStorage.IConfig, workspace: InsomniaFile.IWorkspaceResource) {
    const existingWorkspace = Object.values(config.workspaces).find((w) => w.data._id === workspace._id);
    if (existingWorkspace) {
      throw new AppError(`This workspace already exists in different path ${existingWorkspace.path}.\nImport canceled, to avoid unexpected result. Different workspaces must use unique id. 
      If some workspace is based of existing one, than must be duplicated by Insomnia to have different unique id.\nIf you really want import this workspace, thus delete existing one from Insomnia and from this import manager.`);
    }
  }

  private showLoading(wholeDom: HTMLDivElement, on: boolean, progress?: string): void {
    const overlay = wholeDom.querySelector(".overlay") as HTMLDivElement;
    overlay.style.display = on ? "flex" : "none";

    overlay.innerText = "Working, wait..." + (progress !== undefined ? ` ${progress}` : "");
  }

  private getCommonPath(workspaces: IStorage.IWorkspace[]): string {
    let commonPath = workspaces[0]?.path || "";
    for (const workspace of workspaces) {
      const c1Parts = commonPath.split("");
      const c2Parts = workspace.path.split("");
      for (let i = 0; i < Math.min(c1Parts.length, c2Parts.length); i++) {
        if (c1Parts[i] != c2Parts[i]) {
          commonPath = commonPath.substring(0, i);
          break;
        }
      }
    }
    return commonPath;
  }
}
