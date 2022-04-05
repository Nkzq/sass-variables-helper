# Sass Variables Helper

### VSCode version

```
1.66.0 or higher
```

### Features

This extension add a new tab in your activity bar with a Tree View of your Sass colors variables.
Get an overall look at all your colors easily and copy the associated variable in one click.

After you installed the extension, you have to specify the `relative path` to your sass file you want to explore in your workspace settings.
Add the following line in your workspace settings and edit the path to fit your project :
````js
"sassVariablesHelper.route": "/css/root/vars/_colors.scss"
````

⚠️ If there is more than one folder in your workspace, you can specify an `absolute path`.

If you have variables that are not colors, you need to wrap your colors variables around comments like below
````scss
// COLORS
$maincolor: #26318d;
$maincolor--light: #6f8f9d;
$textcolor: #26318d;
$red: #e40521;
$green: #009f37;
$lightcolor: #fff;
$darkcolor: #000;
$maingrey: #f8f8f8;
$dark-gray: #333;
$darker-gray: #231F20;
$medium-gray: #999;
$light-gray: #EBEBEB;
$grid-border: $light-gray;
// END COLORS
````

Here is a preview of how it looks
![Package Explorer](https://raw.githubusercontent.com/Nkzq/sass-variables-helper/master/resources/sass-variables.png)

### Troubleshooting

Nothing appears ? Double check your settings and try to reload your VSCode window.
Still not working ? Feel free to open a new issue, I'll try to be faster to respond.

Thanks to Sangyong Lee from the Noun Project