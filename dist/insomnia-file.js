"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsomniaFile = void 0;
var InsomniaFile;
(function (InsomniaFile) {
    function isRequestResource(resource) {
        return resource._type === "request";
    }
    InsomniaFile.isRequestResource = isRequestResource;
    function isWorkspaceResource(resource) {
        return resource._type === "workspace";
    }
    InsomniaFile.isWorkspaceResource = isWorkspaceResource;
})(InsomniaFile = exports.InsomniaFile || (exports.InsomniaFile = {}));
//# sourceMappingURL=insomnia-file.js.map