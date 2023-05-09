export namespace Insomnia {
  export interface IContext {
    app: IApp;
    store: IStore;
    data: IData;
    response: IResponse;
  }

  interface IApp {
    getInfo(): { version: string; platform: string };
    alert(title: string, message?: string): Promise<void>;

    dialog(
      title: string,
      body: HTMLElement,
      options?: {
        onHide?: () => void;
        tall?: boolean;
        skinny?: boolean;
        wide?: boolean;
      }
    ): void;

    prompt(
      title: string,
      options?: {
        label?: string;
        defaultValue?: string;
        submitName?: string;
        cancelable?: boolean;
      }
    ): Promise<string>;

    getPath(name: string): string;
    showSaveDialog(options?: { defaultPath?: string }): Promise<string | null>;

    clipboard: {
      readText(): string;
      writeText(text: string): void;
      clear(): void;
    };

    showGenericModalDialog(title: string, options: any): void;
  }
  interface IStore {
    hasItem(key: string): Promise<boolean>;
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    all(): Promise<Array<{ key: string; value: string }>>;
  }

  interface IData {
    export: {
      insomnia: (options: { includePrivate?: boolean; format: "json" | "yaml"; workspace?: IModelWorkspace }) => Promise<string>;
      har(options?: { includePrivate?: boolean }): Promise<string>;
    };
    import: {
      raw: (
        text: string,
        options: {
          workspaceId?: string;
          workspaceScope?: "design" | "collection";
        }
      ) => Promise<void>;
    };
  }

  interface IResponse {
    getBody(): Buffer;
    setBody(body: Buffer): void;
  }

  export interface IModels {
    workspace: IModelWorkspace;
  }

  /**
   * Workspace object in context.model.workspace
   */
  export interface IModelWorkspace {
    created: number;
    description: string;
    modified: number;
    name: string;
    parentId: string;
    scope: string;
    type: string;
    _id: string;
  }
}
