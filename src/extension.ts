'use strict';

import * as vscode from 'vscode';
import { colorProvider } from './sassVariables'
const ncp = require('copy-paste');

export function activate(context: vscode.ExtensionContext) {
	// Following are just data provider samples
	const sassFileRoute = vscode.workspace.getConfiguration('sassVariablesHelper').route
	console.log(vscode.workspace.getConfiguration('sassVariablesHelper'));
	let rootPath = ''
	if (sassFileRoute) {
		rootPath = vscode.workspace.rootPath + sassFileRoute
	}
	const sassVariablesProvider = new colorProvider(rootPath);

	vscode.window.registerTreeDataProvider('sassVariables', sassVariablesProvider);
	vscode.commands.registerCommand('sassVariables.refreshEntry', () => sassVariablesProvider.refresh());
	vscode.commands.registerCommand('extension.openPackageOnNpm', colorName => {
		ncp.copy(`$${colorName}`, function () {
			vscode.window.showInformationMessage('Variable copied to clipboard');
		})
	});
}
