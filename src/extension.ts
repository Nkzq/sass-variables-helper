import * as vscode from 'vscode';
import { colorProvider } from './colorProvider';
const ncp = require('@nkzq/copy-paste');

export function activate(context: vscode.ExtensionContext) {
	const sassFileRoute = vscode.workspace.getConfiguration('sassVariablesHelper').route[0] === '/' ? vscode.workspace.getConfiguration('sassVariablesHelper').route : `/${vscode.workspace.getConfiguration('sassVariablesHelper').route}`
	let rootPath = sassFileRoute;

	if (sassFileRoute && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length < 2) {
		rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath + sassFileRoute;
	}

	const sassVariablesProvider = new colorProvider(rootPath);
	vscode.window.registerTreeDataProvider('sassVariables', sassVariablesProvider);

	// let disposable = vscode.commands.registerCommand('sass-variables-helper.helloWorld', () => {
	// 	vscode.window.showInformationMessage('Hello World from SASS Variables Helper!');
	// });

	// context.subscriptions.push(disposable);

	const copy = vscode.commands.registerCommand('sassVariables.openPackageOnNpm', colorName => {
		ncp.copy(`$${colorName}`, () => {
			vscode.window.showInformationMessage('Variable copied to clipboard');
		})
	});

	context.subscriptions.push(copy);
}
