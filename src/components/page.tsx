import React, { useEffect, useState } from "react";
import { ImportManager } from "../import-manager";
import { Insomnia } from "../insomnia-interfaces";
import Storage, { IStorage } from "../storage";

export interface IPageProps {
  context: Insomnia.IContext;
  importer: ImportManager;
}

interface IOverlay {
  visible: boolean;
  progress: string;
}

export type IOverlayHandler = (visible?: boolean, progress?: string) => void;

export const Page = (props: IPageProps) => {
  const storage = new Storage(props.context);
  const [reload, setReload] = useState<number>(0);
  const [config, setConfig] = useState<IStorage.IConfig>();
  const [overlay, setOverlay] = useState<IOverlay>({
    visible: false,
    progress: "",
  });

  useEffect(() => {
    storage.getConfig().then(setConfig);
  }, [reload]);

  const setProgress: IOverlayHandler = (visible: boolean, progress?: string) => {
    setOverlay((overlay) => ({ ...overlay, visible, progress }));
  };

  const withReload = async (action: () => Promise<void>) => {
    await action();
    setReload((reload) => reload + 1);
  };

  const workspaces = config?.workspaces ? Object.values(config.workspaces) : [];
  workspaces.sort((a, b) => a.data.name.localeCompare(b.data.name));
  const commonPath = workspaces.length > 0 ? getCommonPath(workspaces) : "";
  const tabs = [
    {
      name: "My workspaces",
      active: true,
    },
    {
      name: "IDS",
      active: false,
    },
  ];

  return (
    <div>
      {workspaces.length > 0 && (
        <>
          <div className="tabs">
            {tabs.map((tab) => (
              <div className={"tab tag " + (tab.active ? "bg-info" : "bg-default")} title="Double click to edit">
                {tab.name}
              </div>
            ))}
            <div className="tab tag bg-default" title="Create new group">
              +
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Workspace</th>
                <th>Path</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{workspaces.length}x</td>
                <td>{commonPath ? commonPath + "..." : ""}</td>
                <td>
                  <button className="tag bg-info" onClick={() => withReload(() => props.importer.importAll(workspaces, setProgress))}>
                    Import all
                  </button>
                  <button className="tag bg-info" onClick={() => withReload(() => props.importer.exportAll(workspaces, setProgress))}>
                    Export all
                  </button>
                </td>
              </tr>
              {workspaces.map((workspace, i) => (
                <tr key={i}>
                  <td>
                    <strong>{workspace.data.name}</strong>
                  </td>
                  <td>
                    {commonPath.length > 0 ? "..." : ""}
                    {workspace.path.slice(commonPath.length)}
                  </td>
                  <td>
                    <button className="tag bg-info" onClick={() => withReload(() => props.importer.importWorkspaceByGui(workspace.path, setProgress))}>
                      Import
                    </button>
                    <button className="tag bg-info" onClick={() => withReload(() => props.importer.exportWorkspaceByGui(workspace, setProgress))}>
                      Export
                    </button>
                    <button className="tag bg-danger" onClick={() => withReload(() => props.importer.deleteWorkspaceByGui(workspace, setProgress))}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="tag bg-info"
            style={{ marginTop: "1em", marginLeft: "20px" }}
            onClick={() => withReload(() => props.importer.newImportWizard(setProgress))}
          >
            Add new workspace
          </button>
        </>
      )}
      {overlay.visible && <div className="overlay">Working, wait... {overlay.progress}</div>}
    </div>
  );
};

function getCommonPath(workspaces: IStorage.IWorkspace[]): string {
  let commonPath = workspaces[0]?.path || "";
  for (const workspace of workspaces) {
    const c1Parts = commonPath.split("");
    const c2Parts = workspace.path.split("");
    for (let i = 0; i < Math.min(c1Parts.length, c2Parts.length); i++) {
      if (c1Parts[i] != c2Parts[i]) {
        commonPath = commonPath.substring(0, i);
        break;
      }
    }
  }
  return commonPath;
}
