import { Insomnia } from "./insomnia-interfaces";

export default class ScreenHelper {
  public static async alertError(context: Insomnia.IContext, message: string) {
    return await context.app.alert("Error!", message);
  }

  public static async askNewWorkspaceFilePath(context: Insomnia.IContext) {
    await context.app.alert("Choose Insomnia workspace file", `Choose source file of new workspace. Confirm rewrite question.`);
    const path = await context.app.showSaveDialog();
    return ScreenHelper.normalizePath(path);
  }

  public static async catchErrors(context: Insomnia.IContext, action: () => Promise<void>, finalAction?: () => Promise<void> | void) {
    try {
      await action();
      const res = finalAction();
      if (res instanceof Promise) {
        await res;
      }
    } catch (ex) {
      const res = finalAction();
      if (res instanceof Promise) {
        await res;
      }
      console.error(ex);
      if (ex.constructor.name === "AppError") {
        await ScreenHelper.alertError(context, ex.message);
      } else {
        await ScreenHelper.alertError(context, ex.message + "\nMore in debug console");
      }
    }
  }

  private static normalizePath(path: string): string {
    if (path == null || path == "undefined") {
      return null;
    }
    return path;
  }
}
