"use strict";
import * as vscode from "vscode";

// All openings are check for a space after before adding the cooresponding end except MONITOR and SELECT
// Define a default value for OPENINGS_RPG
const DEFAULT_OPENINGS_RPG = [
    { open: /^\s*BEGSR\s+/i, close: 'EndSr' },
    { open: /^\s*DCL-DS\s+/i, close: 'End-Ds' },
    { open: /^\s*DCL-PR\s+/i, close: 'End-Pr' },
    { open: /^\s*DCL-PI\s+/i, close: 'End-Pi' },
    { open: /^\s*DCL-PROC\s+/i, close: 'End-Proc' },
    { open: /^\s*DOW\s+/i, close: 'Enddo' },
    { open: /^\s*DOU\s+/i, close: 'Enddo' },
    { open: /^\s*FOR\s+/i, close: 'EndFor' },
    { open: /^\s*FOR-EACH\s+/i, close: 'EndFor' },
    { open: /^\s*IF\s+/i, close: 'EndIf' },
    { open: /^\s*MONITOR;/i, close: 'EndMon' },
    { open: /^\s*SELECT;/i, close: 'EndSl' }
];

// Retrieve user-defined OPENINGS_RPG from settings or use the default value
export async function activate(context: vscode.ExtensionContext) {
	console.log("Activate rpg-end-code-blocks");
 	const enter = vscode.commands.registerCommand("rpg-end-code-blocks.enter", async () => {
        await rpgEndCodeBlocksEnter();
    });

    context.subscriptions.push(enter);
}


// Retrieve user-defined OPENINGS_RPG from settings or use the default value
const OPENINGS_RPG_CONFIG = vscode.workspace.getConfiguration().get("rpg-end-code-blocks.openings", DEFAULT_OPENINGS_RPG);

// Convert string representations of regular expressions to RegExp objects
const OPENINGS_RPG = OPENINGS_RPG_CONFIG.map(({ open, close }) => ({
    open: new RegExp(open, "i"),
    close
}));
// Your activate function and other code can use OPENINGS_RPG as needed

const LINE_PARSE_LIMIT = 100000;

async function rpgEndCodeBlocksEnter(calledWithModifier = false) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {return;} // Exit if no open text editor

    const lineNumber = editor.selection.active.line;
    const columnNumber = editor.selection.active.character;
    const lineText = editor.document.lineAt(lineNumber).text;
    const lineLength = lineText.length;

    if (editor.document.languageId.toLowerCase() !== "rpgle") {
        await linebreak(); // Default behavior for non-RPG files
        return;
    }

    let matchedOpening = OPENINGS_RPG.find(({ open }) => open.test(lineText));
    if (matchedOpening && shouldAddEnd(matchedOpening, editor, lineNumber, columnNumber)) {
        await linebreakWithClosing(matchedOpening.close, lineText);
    } else {
        await linebreak();
    }
}

async function linebreakWithClosing(closingTag, lineText) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {return;}

    await editor.edit((textEditor) => {
        const indent = indentationFor(lineText);
        textEditor.insert(
            new vscode.Position(editor.selection.active.line, Number.MAX_VALUE),
            `\n${indent}${closingTag}\;`
        );
    });

    await vscode.commands.executeCommand("cursorUp"); 
    await vscode.commands.executeCommand("editor.action.insertLineAfter");
    // Indent the line
    await vscode.commands.executeCommand("editor.action.indentLines");
}

async function linebreak() {
    await vscode.commands.executeCommand("lineBreakInsert");
	await vscode.commands.executeCommand("cursorDown");
	//await vscode.commands.executeCommand("cursorLineStart");
}

function shouldAddEnd(matchedOpening, editor, lineNumber, columnNumber) {
    const lineText = editor.document.lineAt(lineNumber).text;

    // Conditions to not close the block
    if (lineText.length > columnNumber) {return false;} // Cursor not at end of line

    // Implement more sophisticated checks here if needed, such as checking for existing matching closing tags

    return true;
}

function indentationFor(lineText) {
    const match = lineText.match(/^(\s*)/);
    return match ? match[1] : '';
}
