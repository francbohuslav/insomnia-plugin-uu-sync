import { IInsomniaFile, IInsomniaFileResource } from "./insomnia";

export default class FileNormalizer {
    public normalizeExport(oneLineJson: string): IInsomniaFile {
        const content: IInsomniaFile = JSON.parse(oneLineJson);
        content.__export_date = "2020-01-01T00:00:00.000Z";
        content.resources.forEach(this.setTimestamps);
        content.resources.sort(this.compareResources.bind(this));
        // Delete obsolete
        content.resources.forEach((resource) => {
            if (resource.body && resource.body.__uuSyncText) {
                delete resource.body.__uuSyncText;
            }
        });
        return content;
    }

    public normalizeImport(content: IInsomniaFile): IInsomniaFile {
        this.getRequestsWithBody(content.resources).forEach(this.importMultiLineRequests);
        return content;
    }

    private getRequestsWithBody(resources: IInsomniaFileResource[]): IInsomniaFileResource[] {
        return resources.filter((resource) => resource._type == "request" && resource.body);
    }

    private setTimestamps(resource: IInsomniaFileResource): void {
        if (resource.modified) {
            resource.modified = 1600000000000;
        }
        if (resource.created) {
            resource.created = 1600000000000;
        }
    }

    private compareResources(a: IInsomniaFileResource, b: IInsomniaFileResource): number {
        return this.getSortKey(a).localeCompare(this.getSortKey(b));
    }

    private getSortKey(resource: IInsomniaFileResource): string {
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

    private importMultiLineRequests(resource: IInsomniaFileResource) {
        if (resource.body.__uuSyncText) {
            resource.body.text = resource.body.__uuSyncText.join("\n");
            delete resource.body.__uuSyncText;
        }
    }
}
