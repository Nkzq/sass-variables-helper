# Sass Variables Helper

Preview Sass Variables right in VS Code.

![Sass Variables Helper](https://raw.githubusercontent.com/Nkzq/sass-variables-helper/master/resources/sass-variables.png)

## Features

This extension add a new tab in your activity bar with a Tree View of your Sass colors variables.
Get an overall look at all your colors easily and copy the associated variable in one click.

After you installed the extension, you have to specify the sass file you want to explore in your workspace settings, like so :

```js
"sassVariablesHelper.route": "/css/root/vars/_colors.scss"
```

Specify multiple sass files to pull variables from:

```js
"sassVariablesHelper.route": [ "/css/root/vars/_colors.scss", "/another/file/_other-colors.scss" ]
```

Specify paths relative to the workspace directory:

```js
"sassVariablesHelper.route": [ "./src/scss/_colors.scss", "node_modules/relative/dir/_colors.scss" ]
```

Show color value in the tree:

```js
"sassVariablesHelper.showColorValue": true
```

Copy the color's value not the Sass variable name:

```js
"sassVariablesHelper.shouldCopyColor": true
```

Want to find a name for a color? Run the command `SASS Variables: Name a Color` (in your command pallette `CMD + Shift + P`)

### Road map

- Add search and filter

Thanks to Sangyong Lee from the Noun Project
