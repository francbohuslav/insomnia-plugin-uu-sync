"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, innerError = null) {
        super(message);
        this.innerError = innerError;
    }
}
exports.AppError = AppError;
//# sourceMappingURL=app-error.js.map