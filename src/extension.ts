import * as vscode from "vscode";
import { ColorProvider } from "./sassVariables";
import * as path from "path";
import * as fs from "fs-extra";
const ncp = require("copy-paste");
const nameColor = require("color-names-cli");

async function copyToClipboard(toCopy: string) {
  return new Promise((resolve) => {
    ncp.copy(toCopy, async () => {
      await vscode.window.showInformationMessage(
        `"${toCopy}" copied to clipboard`
      );
      resolve();
    });
  });
}

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
  vscode.commands.registerCommand(
    "extension.copyColor",
    async (colorName, color) => {
      let toCopy = `$${colorName}`;

      if (config.get("shouldCopyColor")) {
        toCopy = color;
      }
      await copyToClipboard(toCopy);
    }
  );

  vscode.commands.registerCommand("sassVariables.nameColor", async () => {
    const color = await vscode.window.showInputBox({
      prompt: "What color would you like to find the name of?",
      placeHolder: "#BADA55",
    });
    if (color === undefined || color === "") {
      return;
    }
    const [actualColor, colorName, foundValue] = nameColor.name(
      color
    ) as string[];
    if (foundValue) {
      const runAgain = "Run Again";
      const response = await vscode.window.showErrorMessage(
        `The color inputted was unable to be parsed, please try again`,
        runAgain
      );
      if (response === runAgain) {
        return vscode.commands.executeCommand("sassVariables.nameColor");
      }
    } else {
      const shouldCopy = "Copy to Clipboard";
      const response = await vscode.window.showInformationMessage(
        `The color you inputted matched closest to "${actualColor}" with the name: ${colorName}`,
        shouldCopy
      );
      if (response === shouldCopy) {
        await copyToClipboard(`${colorName} = ${actualColor};`);
      }
    }
  });
}

export function deactivate(context: vscode.ExtensionContext) {
  // Clean up icons
  fs.removeSync(context.globalStoragePath);
}
