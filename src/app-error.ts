export class AppError extends Error {
    constructor(message: string, public innerError: Error = null) {
        super(message);
    }
}
