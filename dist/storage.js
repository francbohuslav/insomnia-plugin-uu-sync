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
Object.defineProperty(exports, "__esModule", { value: true });
const configKey = "insomnia-plugin-uu-sync-config";
class Storage {
    constructor(context) {
        this.context = context;
    }
    /**
     * For testing purposes
     */
    clearStore() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.context.store.clear();
        });
    }
    getConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const configAsString = yield this.context.store.getItem(configKey);
            let save = false;
            let config = {
                workspaces: {},
                tabs: [],
            };
            try {
                config = JSON.parse(configAsString);
            }
            catch (e) {
                console.error(e);
            }
            if (!config) {
                config = {
                    workspaces: {},
                    tabs: [],
                };
            }
            if (!config.workspaces) {
                config.workspaces = {};
            }
            if (!config.tabs) {
                config.tabs = [];
            }
            if (config.tabs.length === 0) {
                const tab = {
                    id: Date.now(),
                    name: "My workspaces",
                };
                config.tabs.push(tab);
                Object.values(config.workspaces).forEach((workspace) => {
                    workspace.tabId = tab.id;
                });
                save = true;
            }
            if (save) {
                yield this.setConfig(config);
            }
            console.log("Loading", config);
            return config;
        });
    }
    setConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Saving", config);
            const configAsString = JSON.stringify(config);
            return yield this.context.store.setItem(configKey, configAsString);
        });
    }
}
exports.default = Storage;
//# sourceMappingURL=storage.js.map