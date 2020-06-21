import * as vscode from "vscode";
import * as fs from "fs-extra";
import * as path from "path";
const commonDir = require("common-dir");
const scssColors = require("scss-colors");

export class ColorProvider implements vscode.TreeDataProvider<Color> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Color | undefined
  > = new vscode.EventEmitter<Color | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Color | undefined> = this
    ._onDidChangeTreeData.event;

  constructor(
    private workspaceRoot: string[],
    private config: vscode.WorkspaceConfiguration,
    private context: vscode.ExtensionContext
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: Color): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Color): Promise<Color[]> {
    if (!this.workspaceRoot.length) {
      vscode.window.showInformationMessage("No variables in empty workspace");
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(
        this.shortenCommonDirectories(element.filePaths).map(
          (path) =>
            new Color(
              path,
              element.color,
              [],
              this.config,
              this.context,
              vscode.TreeItemCollapsibleState.None,
              {
                command: "extension.copyColor",
                title: "",
                arguments: [element.label],
              }
            )
        )
      );
    }

    return this.getColorsVariables(this.workspaceRoot).then((colorsVars) => {
      if (colorsVars.length === 0) {
        vscode.window.showInformationMessage(
          "Workspace has no color variables"
        );
      }

      return colorsVars;
    });
  }

  private shortenCommonDirectories(paths: string[]): string[] {
    const dir = commonDir(paths);
    return paths.map((p) => path.relative(dir, p));
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private async getColorsVariables(paths: string[]): Promise<Color[]> {
    if (!paths.length) {
      return [];
    }

    const allColors = await Promise.all(
      paths.map(async (p) => {
        const fileContents = await fs.readFile(p, "utf-8");
        const colorMapping: Record<string, string> = scssColors(fileContents);
        return { path: p, colorMapping };
      })
    );
    const colorToPaths = allColors.reduce((map, { path, colorMapping }) => {
      Object.entries(colorMapping).forEach(([colorName]) => {
        if (!map.has(colorName)) {
          map.set(colorName, []);
        }
        map.get(colorName)?.push(path);
      });
      return map;
    }, new Map<string, string[]>());
    const duplicateNames = new Set<string>();

    return allColors.reduce(
      (out, { colorMapping }) =>
        out.concat(
          Object.entries(colorMapping).reduce((out, [colorName, color]) => {
            if (duplicateNames.has(colorName)) {
              return out;
            }

            duplicateNames.add(colorName);
            const paths = colorToPaths.get(colorName) || [];
            return out.concat(
              new Color(
                colorName,
                color,
                paths,
                this.config,
                this.context,
                paths.length > 1
                  ? vscode.TreeItemCollapsibleState.Collapsed
                  : vscode.TreeItemCollapsibleState.None,
                {
                  command: "extension.copyColor",
                  title: "",
                  arguments: [colorName],
                }
              )
            );
          }, [] as Color[])
        ),
      [] as Color[]
    );
  }
}

class Color extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly color: string,
    public readonly filePaths: string[],
    private config: vscode.WorkspaceConfiguration,
    private context: vscode.ExtensionContext,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.tooltip = `$${this.label}: ${this.color}`;
    if (this.config.get("showColorValue")) {
      this.description = this.color;
    }
    this.filePaths = filePaths;

    const iconPath = path.join(
      this.context.globalStoragePath as string,
      `${color}.svg`
    );
    this.iconPath = iconPath;
    this.createIcon(this.color, iconPath);
  }

  private async createIcon(color: string, iconPath: string) {
    await fs.mkdirp(path.dirname(iconPath));
    if (await fs.pathExists(iconPath)) {
      return;
    }
    const iconContent = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="8" fill="${color}"/></svg>`;
    await fs.outputFile(iconPath, iconContent);
  }

  contextValue = "color";
}
