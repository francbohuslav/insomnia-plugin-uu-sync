const storeKey = "insomnia-plugin-uu-sync-filepath";

class WorkspaceRepo {
    constructor(context) {
        this.context = context;
    }

    async getPath() {
        return await this.context.store.getItem(storeKey);
    }

    async setPath(path) {
        return await this.context.store.setItem(storeKey, path);
    }

    async isConfigured() {
        return await this.context.store.hasItem(storeKey);
    }
}

module.exports = WorkspaceRepo;
