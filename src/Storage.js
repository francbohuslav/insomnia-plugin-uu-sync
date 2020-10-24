const storeKey = "insomnia-plugin-uu-sync-filepath";

class Storage {
    constructor(context) {
        this.context = context;
    }

    async getPath(workSpaceName) {
        return await this.context.store.getItem(storeKey + "-" + workSpaceName);
    }

    async setPath(workSpaceName, path) {
        return await this.context.store.setItem(storeKey + "-" + workSpaceName, path);
    }

    async isConfigured(workSpaceName) {
        return await this.context.store.hasItem(storeKey + "-" + workSpaceName);
    }
}

module.exports = Storage;
