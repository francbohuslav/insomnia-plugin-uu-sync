import { InsomniaFile } from "./insomnia-file";

export default class FileNormalizer {
  public normalizeExport(oneLineJson: string): InsomniaFile.IFile {
    const content: InsomniaFile.IFile = JSON.parse(oneLineJson);
    content.__export_date = "2020-01-01T00:00:00.000Z";
    content.resources.forEach(this.setTimestamps);
    content.resources.sort(this.compareResources.bind(this));
    // Delete obsolete
    content.resources.forEach((resource) => {
      if (InsomniaFile.isRequestResource(resource) && resource.body.__uuSyncText) {
        delete resource.body.__uuSyncText;
      }
    });
    return content;
  }

  public normalizeImport(content: InsomniaFile.IFile): InsomniaFile.IFile {
    this.getRequestsWithBody(content.resources).forEach(this.importMultiLineRequests);
    return content;
  }

  private getRequestsWithBody(resources: InsomniaFile.IResource[]): InsomniaFile.IRequestResource[] {
    return resources.filter((resource) => InsomniaFile.isRequestResource(resource) && resource.body) as InsomniaFile.IRequestResource[];
  }

  private setTimestamps(resource: InsomniaFile.IResource): void {
    if (resource.modified) {
      resource.modified = 1600000000000;
    }
    if (resource.created) {
      resource.created = 1600000000000;
    }
  }

  private compareResources(a: InsomniaFile.IResource, b: InsomniaFile.IResource): number {
    return this.getSortKey(a).localeCompare(this.getSortKey(b));
  }

  private getSortKey(resource: InsomniaFile.IResource): string {
    let key = "";
    switch (resource._type) {
      case "workspace":
        key = "0";
        break;
      case "request_group":
        key = "1";
        break;
      case "request":
        key = "2";
        break;
      // this elements should be somewhere at the end
      case "cookie_jar":
        key = "7";
        break;
      case "api_spec":
        key = "8";
        break;
      case "environment":
        key = "9";
        break;
    }
    key += resource._id;
    return key;
  }

  private importMultiLineRequests(resource: InsomniaFile.IRequestResource) {
    if (resource.body.__uuSyncText) {
      resource.body.text = resource.body.__uuSyncText.join("\n");
      delete resource.body.__uuSyncText;
    }
  }
}
