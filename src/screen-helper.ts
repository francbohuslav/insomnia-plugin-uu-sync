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

  private static normalizePath(path: string): string {
    if (path == null || path == "undefined") {
      return null;
    }
    return path;
  }
}
