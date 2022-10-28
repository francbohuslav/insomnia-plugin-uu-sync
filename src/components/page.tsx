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
  const [config, setConfig] = useState<IStorage.IConfig>();
  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined);
  const [overlay, setOverlay] = useState<IOverlay>({
    visible: false,
    progress: "",
  });

  useEffect(() => {
    reloadConfig();
  }, []);

  const setProgress: IOverlayHandler = (visible: boolean, progress?: string) => {
    setOverlay((overlay) => ({ ...overlay, visible, progress }));
  };

  const withReload = async (action: () => Promise<void>) => {
    await action();
    await reloadConfig();
  };

  const reloadConfig = async () => {
    const config = await storage.getConfig();
    setConfig(config);
    if (activeTabId === undefined) {
      setActiveTabId(config.tabs[0].id);
    }
  };

  const showRenameTabDialog = async (tab: IStorage.ITab) => {
    let tabName = "";
    try {
      tabName = await props.context.app.prompt("Name of group. To remove group with its workspaces, delete name and confirm.", {
        cancelable: true,
        defaultValue: tab.name,
        submitName: "Ok",
        label: "Group name",
      });
    } catch (ex) {
      // canceled
      return;
    }

    if (!tabName) {
      // Delete tab
      if (config.tabs.length === 1) {
        props.context.app.alert("Error", "Sorry bro, but last group can not be deleted.");
      } else {
        config.tabs.splice(
          config.tabs.findIndex((t) => t.id === tab.id),
          1
        );
        const newWorkspaces: { [path: string]: IStorage.IWorkspace } = {};
        Object.values(config.workspaces)
          .filter((w) => w.tabId !== tab.id)
          .forEach((w) => {
            newWorkspaces[w.path] = w;
          });
        config.workspaces = newWorkspaces;
        await storage.setConfig(config);
        await reloadConfig();
        setActiveTabId(config.tabs[0].id);
      }
    } else {
      tab.name = tabName;
      await storage.setConfig(config);
      await reloadConfig();
    }
  };

  const showCreateTabDialog = async () => {
    let tabName = "";
    try {
      tabName = await props.context.app.prompt("Create new group", {
        cancelable: true,
        defaultValue: "",
        submitName: "Create group",
        label: "Group name",
      });
    } catch (ex) {
      // canceled
      return;
    }
    if (tabName == "") {
      return;
    }
    const newTab = {
      id: Date.now(),
      name: tabName,
    };
    config.tabs.push(newTab);
    await storage.setConfig(config);
    await reloadConfig();
    setActiveTabId(newTab.id);
  };

  const workspaces = config?.workspaces ? Object.values(config.workspaces).filter((w) => w.tabId === activeTabId) : [];
  workspaces.sort((a, b) => a.data.name.localeCompare(b.data.name));
  const commonPath = workspaces.length > 1 ? getCommonPath(workspaces) : "";

  return (
    <div>
      {activeTabId > 0 && (
        <>
          <div className="tabs">
            {config.tabs.map((tab) => (
              <button
                key={tab.id}
                className={"tab tag " + (tab.id === activeTabId ? "bg-info" : "bg-default")}
                title="Double click to edit"
                onClick={() => setActiveTabId(tab.id)}
                onDoubleClick={() => showRenameTabDialog(tab)}
              >
                {tab.name}
              </button>
            ))}
            <button className="tab tag bg-default" title="Create new group" onClick={() => showCreateTabDialog()}>
              +
            </button>
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
              {workspaces.length > 1 && (
                <tr>
                  <td>{workspaces.length}x</td>
                  <td>{commonPath ? commonPath + "..." : ""}</td>
                  <td>
                    <button className="tag bg-info" onClick={() => withReload(() => props.importer.importAll(workspaces, setProgress, activeTabId))}>
                      Import all
                    </button>
                    <button className="tag bg-info" onClick={() => withReload(() => props.importer.exportAll(workspaces, setProgress))}>
                      Export all
                    </button>
                  </td>
                </tr>
              )}
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
                    <button
                      className="tag bg-info"
                      onClick={() => withReload(() => props.importer.importWorkspaceByGui(workspace.path, setProgress, activeTabId))}
                    >
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
            onClick={() => withReload(() => props.importer.newImportWizard(setProgress, activeTabId))}
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
