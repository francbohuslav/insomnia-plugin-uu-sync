"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_normalizer_1 = __importDefault(require("./file-normalizer"));
const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
class WorkspaceSaver {
    constructor(insomniaFilePath) {
        this.insomniaFilePath = insomniaFilePath;
        this.folderPath = insomniaFilePath + "-resources";
        this.workspaceFile = path.join(this.folderPath, "_workspace.json");
    }
    exportOneFile(jsonObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const formattedJson = JSON.stringify(jsonObject, null, 2);
            yield writeFile(this.insomniaFilePath, formattedJson);
        });
    }
    exportMultipleFiles(jsonObject) {
        return __awaiter(this, void 0, void 0, function* () {
            jsonObject = JSON.parse(JSON.stringify(jsonObject));
            yield mkdir(this.folderPath, { recursive: true });
            const resourcesOnDisk = yield this.getResourcesFiles();
            const filesToRemove = resourcesOnDisk.filter((fileName) => jsonObject.resources.filter((r) => r._id + ".json" == fileName).length == 0);
            for (let resource of jsonObject.resources) {
                yield this.saveResource(resource);
            }
            for (let fileName of filesToRemove) {
                const fullFilePath = path.join(this.folderPath, fileName);
                yield unlink(fullFilePath);
            }
            jsonObject.resources = jsonObject.resources.map(this.getResourceIdWithName);
            const formattedJson = JSON.stringify(jsonObject, null, 2);
            yield writeFile(this.workspaceFile, formattedJson);
        });
    }
    importMultipleFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fs.existsSync(this.workspaceFile)) {
                const formattedJson = yield readFile(this.insomniaFilePath, "utf8");
                let jsonObject = JSON.parse(formattedJson);
                const normalizer = new file_normalizer_1.default();
                jsonObject = normalizer.normalizeImport(jsonObject);
                return jsonObject;
            }
            else {
                const formattedJson = yield readFile(this.workspaceFile, "utf8");
                const jsonObject = JSON.parse(formattedJson);
                const resourcesIds = [...jsonObject.resources];
                jsonObject.resources = [];
                for (const resourceIdWithName of resourcesIds) {
                    const resourceId = this.getResourceIdFromIdWithName(resourceIdWithName);
                    jsonObject.resources.push(yield this.loadResource(resourceId));
                }
                return jsonObject;
            }
        });
    }
    getResourcesFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield readdir(this.folderPath);
            return files.filter((file) => file != "_workspace.json");
        });
    }
    getResourceIdWithName(resource) {
        return resource._id + " | " + resource.name;
    }
    getResourceIdFromIdWithName(resourceIdWithName) {
        return resourceIdWithName.split("|")[0].trim();
    }
    saveResource(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullFilePath = path.join(this.folderPath, resource._id + ".json");
            if (resource._type == "request" && resource.body && resource.body.text) {
                resource.body.text = resource.body.text.split("\n");
            }
            const formattedJson = JSON.stringify(resource, null, 2);
            yield writeFile(fullFilePath, formattedJson);
        });
    }
    loadResource(resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullFilePath = path.join(this.folderPath, resourceId + ".json");
            const formattedJson = yield readFile(fullFilePath);
            const resource = JSON.parse(formattedJson);
            if (resource._type == "request" && resource.body && resource.body.text) {
                resource.body.text = resource.body.text.join("\n");
            }
            return resource;
        });
    }
}
exports.default = WorkspaceSaver;
//# sourceMappingURL=workspace-saver.js.map