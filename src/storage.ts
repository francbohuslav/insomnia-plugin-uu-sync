import { IInsomniaContext } from "./insomnia";

const filepathKey = "insomnia-plugin-uu-sync-filepath";
const lastKey = "insomnia-plugin-uu-sync-last";

export default class Storage {
    constructor(private context: IInsomniaContext) {}

    public async getPath(workSpaceName: string): Promise<string> {
        return await this.context.store.getItem(filepathKey + "-" + workSpaceName);
    }

    public async setPath(workSpaceName: string, path: string) {
        return await this.context.store.setItem(filepathKey + "-" + workSpaceName, path);
    }

    public async isConfigured(workSpaceName: string) {
        return await this.context.store.hasItem(filepathKey + "-" + workSpaceName);
    }

    public async setLast(workSpaceName: string) {
        return await this.context.store.setItem(lastKey, workSpaceName);
    }

    public async getLast() {
        return await this.context.store.getItem(lastKey);
    }
}
