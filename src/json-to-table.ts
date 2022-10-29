import fs from "fs";

const writeFile = fs.promises.writeFile;
export class JsonToTable {
  public getTableHtml(json: any): string {
    const content = [
      `<style>
        .jsonToTable {
          font-family: monospace;
          user-select: text;
        } 
        pre { 
          margin:0; 
          height:1.1em; 
          width:100px; 
          overflow:hidden; 
        } 
        pre:hover {
         height: auto; 
         max-height: 600px;
         left:10px; 
         right:10px; 
         width:auto; 
         position: absolute; 
         background: white; 
         border: 1px solid; 
         box-shadow: 0 0 11px; 
         padding: 1em; 
         margin-top:-1em; 
         overflow:auto;
        }
        .jsonToTable table {
          border-collapse: collapse;
          margin-bottom: 600px;
        }
        .jsonToTable table th { 
          background: #9fffff;
          font-family: monospace;
          font-size: 13px;
          text-transform: none;
          color: black;
          padding: 3px 6px;
          border: 1px solid gray;
        }
        .jsonToTable table td {
          white-space: nowrap;
          font-family: monospace;
          font-size: 13px;
          padding: 3px 6px;
          border: 1px solid gray;
        }
        </style>`,
      "<div class='jsonToTable'>",
    ];
    content.push("<table>");
    let items = [];
    if (Array.isArray(json)) {
      items = json;
    } else if (json.itemList) {
      items = json.itemList;
    } else if (json !== null && typeof json === "object") {
      const firstArrayValue = Object.values(json).find((v) => Array.isArray(v)) as any[];
      items = firstArrayValue || [];
    }
    if (items.length) {
      const keys = Object.keys(items[0]);
      content.push(`<tr><th>Detail</th>${keys.map((key) => `<th>${key}</th>`).join("")}</tr>`);
      items.forEach((item: any) => {
        const detail = JSON.stringify(item, null, 2);
        content.push(
          "<tr><td style='width:100px; '><pre>" +
            detail +
            `</pre></td>${keys
              .map((key) => {
                if (item[key] !== null && typeof item[key] === "object") {
                  return `<td style='width:100px;'><pre>${JSON.stringify(item[key], null, 2)}</pre></td>`;
                }
                return `<td>${item[key]}</td>`;
              })
              .join("")}</tr>`
        );
      });
    }
    content.push("</table></div>");
    return content.join("\n");
  }

  public async saveToFile(filePath: string, content: string): Promise<void> {
    await writeFile(filePath, content, { encoding: "utf-8" });
    var url = filePath;
    var start = process.platform == "darwin" ? "open" : process.platform == "win32" ? "start" : "xdg-open";
    require("child_process").exec(start + " " + url);
  }
}
