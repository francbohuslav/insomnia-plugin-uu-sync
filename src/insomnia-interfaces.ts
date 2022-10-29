export namespace Insomnia {
  export interface IContext {
    app: IApp;
    store: IStore;
    data: IData;
    response: IResponse;
  }

  interface IApp {
    prompt(
      title: string,
      options: {
        label?: string;
        defaultValue?: string;
        submitName?: string;
        cancelable?: boolean;
      }
    ): Promise<string>;
    alert(title: string, message?: string): Promise<void>;
    dialog(title: string, body: HTMLElement, options: any): void;
    showGenericModalDialog(title: string, options: any): void;
    showSaveDialog(params?: any): Promise<string>;
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
      insomnia: (options: { includePrivate: false; format: "json"; workspace: IModelWorkspace }) => Promise<string>;
    };
    import: {
      raw: (content: string) => Promise<void>;
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
