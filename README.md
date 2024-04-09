# rpg-end-code-blocks README

rpg-end-code-blocks - This entension will auto add ending code blocks once you type enter for RPGLE program.  
For example if you type If x=y; and press enter it will automatically add the matching EndIf; to the code and 
move the cursor to the second line indented based on VSCodes indentions. There are default code blocks setup.

You can add the following to your settings.json file and customize them as you see fit
```
    "rpg-end-code-blocks.openings": [
        { "open": "^\\s*IF\\s+\\b", "close": "EndIf" },
        { "open": "^\\s*DCL-DS\\s+\\b", "close": "End-Ds" },
        { "open": "^\\s*DCL-PR\\s+\\b", "close": "End-Pr" },
        { "open": "^\\s*DCL-PROC\\s+\\b", "close": "End-Proc" },
        { "open": "^\\s*DCL-PI\\s+\\b", "close": "End-Pi" },
        { "open": "^\\s*BEGSR\\s+\\b", "close": "EndSr" },
        { "open": "^\\s*DOW\\s+\\b", "close": "EndDo" },
        { "open": "^\\s*DOU\\s+\\b", "close": "EndDo" },
        { "open": "^\\s*FOR\\s+\\b", "close": "EndFor" },
        { "open": "^\\s*MONITOR\\b", "close": "EndMon" },
        { "open": "^\\s*FOR-EACH\\b", "close": "EndFor" }
    ]
```
## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/rpg-end-code-blocks.gif\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

This will only work with ILE RPGLE Free Form 

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
