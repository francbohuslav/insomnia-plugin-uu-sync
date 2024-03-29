"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonToTable = void 0;
const fs_1 = __importDefault(require("fs"));
const writeFile = fs_1.default.promises.writeFile;
class JsonToTable {
    getTableHtml(json) {
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
        }
        else if (json.itemList) {
            items = json.itemList;
        }
        else if (json !== null && typeof json === "object") {
            const firstArrayValue = Object.values(json).find((v) => Array.isArray(v));
            items = firstArrayValue || [];
        }
        if (items.length) {
            const keys = Object.keys(items[0]);
            content.push(`<tr><th>Detail</th>${keys.map((key) => `<th>${key}</th>`).join("")}</tr>`);
            items.forEach((item) => {
                const detail = JSON.stringify(item, null, 2);
                content.push("<tr><td style='width:100px; '><pre>" +
                    detail +
                    `</pre></td>${keys
                        .map((key) => {
                        if (item[key] !== null && typeof item[key] === "object") {
                            return `<td style='width:100px;'><pre>${JSON.stringify(item[key], null, 2)}</pre></td>`;
                        }
                        return `<td>${item[key]}</td>`;
                    })
                        .join("")}</tr>`);
            });
        }
        content.push("</table></div>");
        return content.join("\n");
    }
    saveToFile(filePath, content) {
        return __awaiter(this, void 0, void 0, function* () {
            yield writeFile(filePath, content, { encoding: "utf-8" });
            var url = filePath;
            var start = process.platform == "darwin" ? "open" : process.platform == "win32" ? "start" : "xdg-open";
            require("child_process").exec(start + " " + url);
        });
    }
}
exports.JsonToTable = JsonToTable;
//# sourceMappingURL=json-to-table.js.map