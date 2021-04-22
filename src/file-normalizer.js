class FileNormalizer {
    normalizeExport(oneLineJson) {
        const content = JSON.parse(oneLineJson);
        content.__export_date = "2020-01-01T00:00:00.000Z";
        content.resources.forEach(this.setTimestamps);
        content.resources.sort(this.compareResources.bind(this));
        // Delete obsolete
        content.resources.forEach((resource) => {
            if (resource.body && resource.body.__uuSyncText) {
                delete resource.body.__uuSyncText;
            }
        });
        this.setTimestamps(content);
        return content;
    }

    normalizeImport(content) {
        this.getRequestsWithBody(content.resources).forEach(this.importMultiLineRequests);
        return content;
    }

    getRequestsWithBody(resources) {
        return resources.filter((resource) => resource._type == "request" && resource.body);
    }

    setTimestamps(resource) {
        if (resource.modified) {
            resource.modified = 1600000000000;
        }
        if (resource.created) {
            resource.created = 1600000000000;
        }
    }

    compareResources(a, b) {
        return this.getSortKey(a).localeCompare(this.getSortKey(b));
    }

    getSortKey(resource) {
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

    importMultiLineRequests(resource) {
        if (resource.body.__uuSyncText) {
            resource.body.text = resource.body.__uuSyncText.join("\n");
        }
    }
}

module.exports = FileNormalizer;
