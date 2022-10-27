export namespace InsomniaFile {
  export interface IFile {
    resources: IResource[];
    _type: "export";
    __export_date: string;
    __export_source: string;
    __export_format: number;
  }

  export interface IResource {
    _id: string;
    _type: "workspace" | "request_group" | "request" | "cookie_jar" | "api_spec" | "environment";
    name: string;
    created: number;
    modified: number;
    description: string;
    parentId?: any;
  }

  export interface IRequestResource extends IResource {
    body: IResourceBody;
  }

  export interface IWorkspaceResource extends IResource {
    scope: string;
  }

  interface IResourceBody {
    text: string;
    /** @deprecated */
    __uuSyncText: string[];
  }

  export function isRequestResource(resource: IResource): resource is IRequestResource {
    return resource._type === "request";
  }
  export function isWorkspaceResource(resource: IResource): resource is IWorkspaceResource {
    return resource._type === "workspace";
  }
}
