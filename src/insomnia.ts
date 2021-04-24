export interface IInsomniaContext {
    app: IInsomniaApp;
    store: IInsomniaStore;
    data: IInsomniaData;
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
    prompt(title: string, params: any): Promise<string>;
    alert(title: string, message: string): Promise<void>;
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

interface IInsomniaFileResourceBody {
    text: string;
    /** @deprecated */
    __uuSyncText: string[];
}
