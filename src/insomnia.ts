export interface IInsomniaContext {
  app: IInsomniaApp;
  store: IInsomniaStore;
  data: IInsomniaData;
  response: IInsomniaResponse;
}

export interface IInsomniaModels {
  workspace: {
    name: string;
  };
}

interface IInsomniaStore {
  hasItem(key: string): Promise<boolean>;
  getItem(key: string): Promise<string>;
  setItem(key: string, value: string): Promise<void>;
}
interface IInsomniaApp {
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
interface IInsomniaData {
  export: {
    insomnia: (params: any) => Promise<string>;
  };
  import: {
    raw: (content: string) => Promise<void>;
  };
}
export interface IInsomniaFile {
  resources: IInsomniaFileResource[];
  __export_date: string;
}

export interface IInsomniaFileResource {
  _id: string;
  _type: "workspace" | "request_group" | "request" | "cookie_jar" | "api_spec" | "environment";
  body: IInsomniaFileResourceBody;
  name: string;
  created: number;
  modified: number;
}

export interface IInsomniaFileWorkspace {
  name: string;
}

interface IInsomniaFileResourceBody {
  text: string;
  /** @deprecated */
  __uuSyncText: string[];
}

interface IInsomniaResponse {
  getBody(): Buffer;
  setBody(body: Buffer): void;
}

export interface IStorageConfig {
  workspaces: { [path: string]: IStorageConfig_Workspace };
}
export interface IStorageConfig_Workspace {
  name: string;
  path: string;
}
