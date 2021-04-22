const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

/**
 * @typedef {Object} IResource
 * @property {string} _id
 */

/**
 * @typedef {Object} IWorkspace
 * @property {IResource[]} resources
 */

class WorkspaceSaver {
    constructor(insomniaFilePath) {
        this.insomniaFilePath = insomniaFilePath;
        this.folderPath = insomniaFilePath + "-resources";
    }

    async exportOneFile(jsonObject) {
        const formattedJson = JSON.stringify(jsonObject, null, 2);
        await writeFile(this.insomniaFilePath, formattedJson);
    }

    /**
     *
     * @param {string} insomniaFilePath
     * @param {IWorkspace} jsonObject
     * @returns {Promise<void>}
     */
    async exportMultipleFiles(jsonObject) {
        jsonObject = JSON.parse(JSON.stringify(jsonObject));
        await mkdir(this.folderPath, { recursive: true });
        const resourcesOnDisk = await this.getResourcesFiles();
        const filesToRemove = resourcesOnDisk.filter((fileName) => jsonObject.resources.filter((r) => r._id + ".json" == fileName).length == 0);
        for (let resource of jsonObject.resources) {
            await this.saveResource(resource);
        }
        for (let fileName of filesToRemove) {
            const fullFilePath = path.join(this.folderPath, fileName);
            await unlink(fullFilePath);
        }
        jsonObject.resources = jsonObject.resources.map((resource) => resource._id);
        const formattedJson = JSON.stringify(jsonObject, null, 2);
        writeFile(path.join(this.folderPath, "_workspace.json"), formattedJson);
    }

    async getResourcesFiles() {
        const files = await readdir(this.folderPath);
        return files.filter((file) => file != "_workspace.json");
    }
    /**
     *
     * @param {IResource} resource
     */
    async saveResource(resource) {
        const fullFilePath = path.join(this.folderPath, resource._id + ".json");
        if (resource._type == "request" && resource.body && resource.body.text) {
            resource.body.text = resource.body.text.split("\n");
        }
        const formattedJson = JSON.stringify(resource, null, 2);
        await writeFile(fullFilePath, formattedJson);
    }
}

module.exports = WorkspaceSaver;
