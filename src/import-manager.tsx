import React from "react";
import { createRoot } from "react-dom/client";
import { AppError } from "./app-error";
import { IOverlayHandler, Page } from "./components/page";
import FileNormalizer from "./file-normalizer";
import { InsomniaFile } from "./insomnia-file";
import { Insomnia } from "./insomnia-interfaces";
import ScreenHelper from "./screen-helper";
import InsomniaStorage, { IStorage } from "./storage";
import WorkspaceSaver from "./workspace-saver";

export class ImportManager {
  storage: InsomniaStorage;

  constructor(private context: Insomnia.IContext) {
    this.storage = new InsomniaStorage(this.context);
  }

  async getManagerDom(): Promise<HTMLElement> {
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
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30px;
      min-height: 200px;
    }
    </style>
    `;

    const reactDom = document.createElement("div");
    wholeDom.appendChild(reactDom);
    const root = createRoot(reactDom);
    root.render(<Page importer={this} context={this.context} />);
    return wholeDom;
  }

  public exportAll(workspaces: IStorage.IWorkspace[], setOverlay: IOverlayHandler) {
    return ScreenHelper.catchErrors(
      this.context,
      async () => {
        setOverlay(true, "0%");
        let counter = 0;
        await Promise.all(
          [...workspaces].map((workspace) =>
            this.exportWorkspace(workspace).then(() => {
              counter++;
              setOverlay(true, ((counter / workspaces.length) * 100).toFixed(0) + "%");
            })
          )
        );
      },
      () => setOverlay()
    );
  }

  public importAll(workspaces: IStorage.IWorkspace[], setOverlay: IOverlayHandler) {
    return ScreenHelper.catchErrors(
      this.context,
      async () => {
        for (const workspace of workspaces) {
          setOverlay(true, workspace.data.name);
          await this.importWorkspace(workspace.path);
        }
      },
      () => {
        setOverlay();
      }
    );
  }

  public async newImportWizard(setOverlay: IOverlayHandler) {
    const filePath = await ScreenHelper.askNewWorkspaceFilePath(this.context);
    if (filePath == null) {
      return;
    }
    await this.importWorkspaceByGui(filePath, setOverlay);
  }

  public importWorkspaceByGui(filePath: string, setOverlay: IOverlayHandler, progress?: string) {
    return ScreenHelper.catchErrors(
      this.context,
      async () => {
        setOverlay(true, progress);
        await this.importWorkspace(filePath);
      },
      () => {
        setOverlay();
      }
    );
  }

  public exportWorkspaceByGui(workspace: IStorage.IWorkspace, setOverlay: IOverlayHandler, progress?: string) {
    return ScreenHelper.catchErrors(
      this.context,
      async () => {
        setOverlay(true, progress);
        await this.exportWorkspace(workspace);
      },
      () => {
        setOverlay();
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

  public async deleteWorkspaceByGui(workspace: IStorage.IWorkspace, setOverlay: IOverlayHandler) {
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
        setOverlay(true);
        delete config.workspaces[workspace.path];
        await this.storage.setConfig(config);
      },
      () => {
        setOverlay();
      }
    );
  }

  public async importWorkspace(filePath: string): Promise<void> {
    const workspaceSaver = new WorkspaceSaver(filePath);
    let json = await workspaceSaver.loadWorkspaceFile();
    let workspace: InsomniaFile.IWorkspaceResource | undefined = json.resources?.filter((r) => InsomniaFile.isWorkspaceResource(r))[0] as any;
    const config = await this.storage.getConfig();
    this.checkWorkspaceUniqueness(config, workspace, filePath);
    await this.context.data.import.raw(JSON.stringify(json));
    config.workspaces[filePath] = {
      path: filePath,
      data: workspace,
    };
    await this.storage.setConfig(config);
  }

  private checkWorkspaceUniqueness(config: IStorage.IConfig, workspace: InsomniaFile.IWorkspaceResource, filePath: string) {
    const existingWorkspace = Object.values(config.workspaces).find((w) => w.data._id === workspace._id && w.path !== filePath);
    if (existingWorkspace) {
      throw new AppError(`This workspace already exists in different path ${existingWorkspace.path}.\nImport canceled, to avoid unexpected result. Different workspaces must use unique id. 
      If some workspace is based of existing one, than must be duplicated by Insomnia to have different unique id.\nIf you really want import this workspace, thus delete existing one from Insomnia and from this import manager.`);
    }
  }
}
