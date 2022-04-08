import * as vscode from 'vscode';
import { colorProvider } from './sassVariables';
const ncp = require('@nkzq/copy-paste');

export function activate(context: vscode.ExtensionContext) {

	const sassFileRoute = vscode.workspace.getConfiguration('sassVariablesHelper').route[0] === '/' ? vscode.workspace.getConfiguration('sassVariablesHelper').route : `/${vscode.workspace.getConfiguration('sassVariablesHelper').route}`
	let rootPath = sassFileRoute;

	if (sassFileRoute && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length < 2) {
		rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath + sassFileRoute;
	}

	const sassVariablesProvider = new colorProvider(rootPath);

	vscode.window.registerTreeDataProvider('sassVariables', sassVariablesProvider);

	const disposable = vscode.commands.registerCommand('sassVariables.refresh', () => {
		sassVariablesProvider.refresh();
	});

	context.subscriptions.push(disposable);

	vscode.commands.registerCommand('extension.openPackageOnNpm', colorName => {
		ncp.copy(`$${colorName}`, () => {
			vscode.window.showInformationMessage('Variable copied to clipboard');
		})
	});
}