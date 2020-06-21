import * as vscode from "vscode";
import { ColorProvider } from "./sassVariables";
import * as path from "path";
import * as fs from "fs-extra";
const ncp = require("copy-paste");

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("sassVariablesHelper");
  const { route: fileRoutes } = config;

  const sassFileRoutes: string[] = []
    .concat(fileRoutes)
    .filter(Boolean)
    .map((route: string) => {
      if (path.isAbsolute(route)) {
        return fs.existsSync(route) ? route : "";
      }
      const folders = vscode.workspace.workspaceFolders;

      if (!folders) {
        return "";
      }

      return (
        folders
          .map(({ uri: { fsPath: folder } }) => path.resolve(folder, route))
          .find((filePath) => fs.existsSync(filePath)) || ""
      );
    })
    .filter(Boolean);
  const sassVariablesProvider = new ColorProvider(
    sassFileRoutes,
    config,
    context
  );

  vscode.window.registerTreeDataProvider(
    "sassVariables",
    sassVariablesProvider
  );
  vscode.commands.registerCommand("sassVariables.refreshEntry", () =>
    sassVariablesProvider.refresh()
  );
  vscode.commands.registerCommand("extension.copyColor", (colorName, color) => {
    let toCopy = `$${colorName}`;

    if (config.get("shouldCopyColor")) {
      toCopy = color;
    }
    ncp.copy(toCopy, () => {
      vscode.window.showInformationMessage(`"${toCopy}" copied to clipboard`);
    });
  });
}

export function deactivate(context: vscode.ExtensionContext) {
  // Clean up icons
  fs.removeSync(context.globalStoragePath);
}
