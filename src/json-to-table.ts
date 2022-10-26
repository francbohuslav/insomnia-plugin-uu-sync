import { writeFile } from "fs/promises";

export class JsonToTable {
  public async saveToFile(filePath: string, json: any): Promise<void> {
    const content = [
      `<style>
        body {
          overflow-x: scroll; 
          font-family: monospace;
        } 
        pre { 
          margin:0; 
          height:1.1em; 
          width:100px; 
          overflow:hidden; 
        } 
        pre:hover {
         height: auto; 
         left:10px; 
         right:10px; 
         width:auto; 
         position: fixed; 
         background: white; 
         border: 1px solid; 
         box-shadow: 0 0 11px; 
         padding: 1em; 
         margin-top:-1em; 
         overflow:auto;
        }
        table {
          border-collapse: collapse;
        }
        th { 
          background: #9fffff;
        }
        td {
          white-space: nowrap;
        }
        </style>`,
    ];
    content.push("<table border=1 cellspacing=0 cellpadding=4>");
    const items = json.itemList || [];
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
    content.push("</table>");
    await writeFile(filePath, content.join("\n"), { encoding: "utf-8" });
    var url = filePath;
    var start = process.platform == "darwin" ? "open" : process.platform == "win32" ? "start" : "xdg-open";
    require("child_process").exec(start + " " + url);
  }
}
