import { InsomniaFile } from "./insomnia-file";
import { Insomnia } from "./insomnia-interfaces";

const configKey = "insomnia-plugin-uu-sync-config";

export default class Storage {
  constructor(private context: Insomnia.IContext) {}
  public async getConfig(): Promise<IStorage.IConfig> {
    const configAsString = await this.context.store.getItem(configKey);
    let config: IStorage.IConfig = {
      workspaces: {},
    };
    try {
      config = JSON.parse(configAsString);
    } catch (e) {
      console.error(e);
    }
    if (!config) {
      config = {
        workspaces: {},
      };
    }
    if (!config.workspaces) {
      config.workspaces = {};
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
  }
  export interface IWorkspace {
    path: string;
    data: InsomniaFile.IWorkspaceResource;
  }
}
