import { IInsomniaContext, IStorageConfig } from "./insomnia";

const configKey = "insomnia-plugin-uu-sync-config";

export default class Storage {
  constructor(private context: IInsomniaContext) {}
  public async getConfig(): Promise<IStorageConfig> {
    const configAsString = await this.context.store.getItem(configKey);
    let config: IStorageConfig = {
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
    return config;
  }

  public async setConfig(config: IStorageConfig): Promise<void> {
    const configAsString = JSON.stringify(config);
    return await this.context.store.setItem(configKey, configAsString);
  }
}
