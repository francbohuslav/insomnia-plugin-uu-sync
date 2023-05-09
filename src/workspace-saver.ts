import { AppError } from "./app-error";
import FileNormalizer from "./file-normalizer";
import { InsomniaFile } from "./insomnia-file";

const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

export default class WorkspaceSaver {
  private folderPath: string;
  private workspaceFile: string;

  constructor(private insomniaFilePath: string) {
    this.folderPath = insomniaFilePath + "-resources";
    this.workspaceFile = path.join(this.folderPath, "_workspace.json");
  }

  public async exportOneFile(jsonObject: InsomniaFile.IFile): Promise<void> {
    const formattedJson = JSON.stringify(jsonObject, null, 2);
    await writeFile(this.insomniaFilePath, formattedJson);
  }

  public async exportMultipleFiles(jsonObject: InsomniaFile.IFile): Promise<void> {
    try {
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
      jsonObject.resources = jsonObject.resources.map(this.getResourceIdWithName) as any;
      const formattedJson = JSON.stringify(jsonObject, null, 2);
      await writeFile(this.workspaceFile, formattedJson);
    } catch (err) {
      throw new AppError(`Error during saving of file ${this.workspaceFile}\n${err}`, err);
    }
  }

  public async loadWorkspaceFile(): Promise<InsomniaFile.IFile> {
    if (!fs.existsSync(this.workspaceFile)) {
      try {
        const formattedJson = await readFile(this.insomniaFilePath, "utf8");
        let jsonObject: InsomniaFile.IFile = JSON.parse(formattedJson);
        const normalizer = new FileNormalizer();
        jsonObject = normalizer.normalizeImport(jsonObject);
        return jsonObject;
      } catch (err) {
        throw new AppError(`Error during loading of file ${this.insomniaFilePath}\n${err}`, err);
      }
    } else {
      try {
        const formattedJson = await readFile(this.workspaceFile, "utf8");
        const jsonObject: InsomniaFile.IFile = JSON.parse(formattedJson);
        const resourcesIds: string[] = [...jsonObject.resources] as any;
        jsonObject.resources = [];
        for (const resourceIdWithName of resourcesIds) {
          const resourceId = this.getResourceIdFromIdWithName(resourceIdWithName as string);
          jsonObject.resources.push(await this.loadResource(resourceId));
        }
        // Existence of ApiSpec (api_spec) implicates that document is design. But we need collection, so delete them.
        // Same problem should be also in few lines above in orignal insmnomnia workspace file... but I am lazy to do that :-)
        jsonObject.resources = jsonObject.resources.filter((r) => r._type !== "api_spec");
        return jsonObject;
      } catch (err) {
        throw new AppError(`Error during loading of file ${this.workspaceFile}\n${err}`, err);
      }
    }
  }

  private async getResourcesFiles(): Promise<string[]> {
    const files: string[] = await readdir(this.folderPath);
    return files.filter((file) => file != "_workspace.json");
  }

  private getResourceIdWithName(resource: InsomniaFile.IResource): string {
    return resource._id + " | " + resource.name;
  }

  private getResourceIdFromIdWithName(resourceIdWithName: string): string {
    return resourceIdWithName.split("|")[0].trim();
  }

  private async saveResource(resource: InsomniaFile.IResource): Promise<void> {
    const fullFilePath = path.join(this.folderPath, resource._id + ".json");
    try {
      if (InsomniaFile.isRequestResource(resource) && resource.body && resource.body.text) {
        resource.body.text = resource.body.text.split("\n") as any;
      }
      const formattedJson = JSON.stringify(resource, null, 2);
      await writeFile(fullFilePath, formattedJson);
    } catch (err) {
      throw new AppError(`Error during saving of file ${fullFilePath}\n${err}`, err);
    }
  }

  private async loadResource(resourceId: string): Promise<InsomniaFile.IResource> {
    const fullFilePath = path.join(this.folderPath, resourceId + ".json");
    try {
      const formattedJson = await readFile(fullFilePath);
      const resource: InsomniaFile.IResource = JSON.parse(formattedJson);
      if (InsomniaFile.isRequestResource(resource) && resource.body && resource.body.text) {
        resource.body.text = (resource.body.text as any).join("\n");
      }
      return resource;
    } catch (err) {
      throw new AppError(`Error during loading of file ${fullFilePath}\n${err}`, err);
    }
  }
}
