export class ImportManager {
  getManagerDom(): HTMLElement {
    const workspaces = [
      {
        name: "uu_energygateway_datagatewayg01",
        path: "C:\\Gateway\\vNext\\uu_energygateway_datagatewayg01\\uu_energygateway_datagatewayg01-server\\src\\test\\insomnia\\insomnia-workspace-asyncjob.json",
      },
      {
        name: "uu_energygateway_messageregistry01",
        path: "C:\\Gateway\\vNext\\uu_energygateway_messageregistry01\\uu_energygateway_messageregistry01-server\\src\\test\\insomnia\\insomnia-workspace-asyncjob.json",
      },
      {
        name: "uu_energygateway_datagatewayg01",
        path: "C:\\Gateway\\vNext\\uu_energygateway_datagatewayg01\\uu_energygateway_datagatewayg01-server\\src\\test\\insomnia\\insomnia-workspace-asyncjob.json",
      },
    ];

    const wholeDemo = document.createElement("div");
    wholeDemo.classList.add("import-manager");
    wholeDemo.style.padding = "10px";
    wholeDemo.innerHTML = `
    <style>
    .import-manager{
      padding: 10px;
    }
    .import-manager td, .import-manager th {
      padding: 4px 8px;
    }
    </style>
    <table>
    <tr>
    <th>Workspace</th>
    <th>Path</th>
    <th>Action</th>
    </tr>
    </table>`;
    const body = wholeDemo.querySelector("tbody");

    workspaces.forEach((workspace) => {
      const tr = document.createElement("tr");
      let td = document.createElement("td");
      td.innerHTML = `<strong>${workspace.name}</strong>`;
      tr.appendChild(td);

      td = document.createElement("td");
      td.innerText = workspace.path;
      tr.appendChild(td);

      td = document.createElement("td");
      const button = document.createElement("button");
      button.classList.add("tag");
      button.classList.add("bg-info");
      button.innerText = "Import";
      td.appendChild(button);
      tr.appendChild(td);

      body.appendChild(tr);
    });

    return wholeDemo;
  }
}
