import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class colorProvider implements vscode.TreeDataProvider<Color> {

	private _onDidChangeTreeData: vscode.EventEmitter<Color | undefined> = new vscode.EventEmitter<Color | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Color | undefined> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Color): vscode.TreeItem {
		return element;
	}

	getChildren(): Thenable<Color[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No variables in empty workspace');
			return Promise.resolve([]);
		}
		const colorsFile = this.workspaceRoot
		if (this.pathExists(colorsFile)) {
			return Promise.resolve(this.getColorsVariables(colorsFile));
		} else {
			vscode.window.showInformationMessage('Workspace has color variables');
			return Promise.resolve([]);
		}
	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getColorsVariables(colorsFile: string): Color[] {
		if (this.pathExists(colorsFile)) {
			const variables = fs.readFileSync(colorsFile, 'utf-8');
			const match = variables.match(/(\$.*\;)/g);
			const colorsArr = [];
			for (let i = 0; i < match.length; i++) {
				const m = match[i];
				const split = m.split(':');
				const color = {
					'colorName': split[0].replace('$', ''),
					'color': split[1].trim().replace(';', '')
				}
				colorsArr.push(color)
			}

			const toColor = (colorName: string, color: string): Color => {
				return new Color(colorName, color, vscode.TreeItemCollapsibleState.None, {
					command: 'extension.openPackageOnNpm',
					title: '',
					arguments: [colorName]
				});
			}

			const colors = this.cleanDuplicateColors(colorsArr)
				? colorsArr.map(c => toColor(c['colorName'], c['color']))
				: [];
			return colors;
		} else {
			return [];
		}
	}

	private cleanDuplicateColors(colors: any[]): any[] {
		const dup = colors.filter(c => c.color.match(/(\$.*)/g));
		dup.map(d => {
			const label = d.color.replace('$', '');
			const findColor = colors.filter(c => c.colorName === label)[0];
			d.color = findColor.color;
		})
		return [...colors, ...dup]
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

class Color extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private color: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.createIcon(this.color)
	}

	get tooltip(): string {
		return `${this.label} : ${this.color}`
	}

	private cleanFolderIcons(dirPath: string) {
		try { var files = fs.readdirSync(dirPath); }
		catch(e) { return; }
		if (files.length > 0) {
			for (var i = 0; i < files.length; i++) {
			var filePath = dirPath + '/' + files[i];
			if (fs.statSync(filePath).isFile())
				fs.unlinkSync(filePath);
			else
				this.cleanFolderIcons(filePath);
			}
		}
	}
	private async createIcon(color: string) {
		const iconPath = path.join(__filename, '..', '..', '..', 'resources', 'color', `${color}.svg`);
		await this.cleanFolderIcons(path.join(__filename, '..', '..', '..', 'resources', 'color'))
		if (this.pathExists(iconPath)) {
			return false
		}
		const iconContent = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="8" fill="${color}"/></svg>`
		try{
			fs.writeFileSync(iconPath, iconContent);
		}catch (e){
			console.log(e);
		}
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}
		return true;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'color', `${this.color}.svg`),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'color', `${this.color}.svg`)
	};

	contextValue = 'color';

}