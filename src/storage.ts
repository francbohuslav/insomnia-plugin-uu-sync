import { InsomniaFile } from "./insomnia-file";
import { Insomnia } from "./insomnia-interfaces";

const configKey = "insomnia-plugin-uu-sync-config";

export default class Storage {
  constructor(private context: Insomnia.IContext) {}

  public async getConfig(): Promise<IStorage.IConfig> {
    const configAsString = await this.context.store.getItem(configKey);
    let config: IStorage.IConfig = {
      workspaces: {},
      tabs: [],
    };
    try {
      config = JSON.parse(configAsString);
    } catch (e) {
      console.error(e);
    }
    if (!config) {
      config = {
        workspaces: {},
        tabs: [],
      };
    }
    if (!config.workspaces) {
      config.workspaces = {};
    }
    if (!config.tabs) {
      config.tabs = [];
    }
    if (config.tabs.length === 0) {
      const tab = {
        id: Date.now(),
        name: "My workspaces",
      };
      config.tabs.push(tab);
      Object.values(config.workspaces).forEach((workspace) => {
        workspace.tabId = tab.id;
      });
    }
    console.log("Loading", config);
    return config;
  }

  public async setConfig(config: IStorage.IConfig): Promise<void> {
    console.log("Saving", config);
    const configAsString = JSON.stringify(config);
    return await this.context.store.setItem(configKey, configAsString);
  }
}

export namespace IStorage {
  export interface IConfig {
    workspaces: { [path: string]: IWorkspace };
    tabs: ITab[];
  }
  export interface IWorkspace {
    tabId: number;
    path: string;
    data: InsomniaFile.IWorkspaceResource;
  }
  export interface ITab {
    id: number;
    name: string;
  }
}
