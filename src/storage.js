const filepathKey = "insomnia-plugin-uu-sync-filepath";
const lastKey = "insomnia-plugin-uu-sync-last";

class Storage {
    constructor(context) {
        this.context = context;
    }

    async getPath(workSpaceName) {
        return await this.context.store.getItem(filepathKey + "-" + workSpaceName);
    }

    async setPath(workSpaceName, path) {
        return await this.context.store.setItem(filepathKey + "-" + workSpaceName, path);
    }

    async isConfigured(workSpaceName) {
        return await this.context.store.hasItem(filepathKey + "-" + workSpaceName);
    }

    async setLast(workSpaceName) {
        return await this.context.store.setItem(lastKey, workSpaceName);
    }

    async getLast() {
        return await this.context.store.getItem(lastKey);
    }
}

module.exports = Storage;
