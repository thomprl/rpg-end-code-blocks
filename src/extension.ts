"use strict";
import * as vscode from "vscode";

// All openings are check for a space after before adding the cooresponding end except MONITOR and SELECT
// Define a default value for OPENINGS_RPG
const DEFAULT_OPENINGS_RPG = [
    { "open": "^\\s*BEGSR\\b", "close": "EndSr" },
    { "open": "^\\s*DCL-DS\\b", "close": "End-Ds" },
    { "open": "^\\s*DCL-ENUM\\b", "close": "End-Enum" },        
    { "open": "^\\s*DCL-PR\\b", "close": "End-Pr" },
    { "open": "^\\s*DCL-PI\\b", "close": "End-Pi" },
    { "open": "^\\s*DCL-PROC\\b", "close": "End-Proc" },
    { "open": "^\\s*DOW\\b", "close": "EndDo" },
    { "open": "^\\s*DOU\\b", "close": "EndDo" },
    { "open": "^\\s*FOR\\b", "close": "EndFor" },
    { "open": "^\\s*FOR-EACH\\b", "close": "EndFor" },
    { "open": "^\\s*IF\\b", "close": "EndIf" },
    { "open": "^\\s*MONITOR\\s*;", "close": "EndMon" },
    { "open": "^\\s*SELECT\\s*;", "close": "EndSl" }
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

    // Ensure the cursor is at the end of the current line so insertion happens
    // in the intended location even if the cursor was elsewhere on the line.
    try {
        const currentLine = editor.selection.active.line;
        const lineEnd = editor.document.lineAt(currentLine).range.end;
        editor.selection = new vscode.Selection(lineEnd, lineEnd);
    } catch (e) {
        // If anything goes wrong, fall back to default behavior (do nothing).
    }

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
    const document = editor.document;
    const lineText = document.lineAt(lineNumber).text;

    // 1. Ensure the cursor is after the line's semicolon.
    // We only add end-blocks when the user has the cursor placed after the ';' (e.g., DCL-DS myds;|)
    // If there's no semicolon on the line, do not add the end-block.
    const semicolonPos = lineText.lastIndexOf(';');
    if (semicolonPos === -1) {
        return false;
    }
    // Require the cursor column to be strictly greater than the semicolon's index
    // (so the cursor is positioned after the semicolon).
    if (columnNumber <= semicolonPos) {
        return false;
    }

    const closingTag = matchedOpening.close.toUpperCase();
    const openingPattern = matchedOpening.open;
    const currentIndent = lineText.match(/^(\s*)/)?.[1] ?? '';

    const maxLines = Math.min(document.lineCount, lineNumber + 20);

    // New check: if the same line already contains the corresponding closing tag,
    // do not add an end block. This handles cases like "IF ... EndIf;" on one line.
    try {
        const escapedClose = matchedOpening.close.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const sameLineCloseRegex = new RegExp(`${escapedClose}(\\s*;|\\b)`, 'i');
        if (sameLineCloseRegex.test(lineText)) {
            return false;
        }
    } catch (e) {
        // If regex construction fails for some reason, fall back to a simple case-insensitive
        // substring check as a safe default.
        if (lineText.toUpperCase().indexOf(closingTag) !== -1) {
            return false;
        }
    }

    for (let i = lineNumber + 1; i < maxLines; i++) {
        const nextLine = document.lineAt(i).text;
        
        const nextIndent = nextLine.match(/^(\s*)/)?.[1] ?? '';
        const trimmedUpper = nextLine.trim().toUpperCase();

        // Case 1: Found closing tag at same indent – cancel
        if ((trimmedUpper === `${closingTag};` || trimmedUpper.startsWith(`${closingTag} `)) &&
            nextIndent === currentIndent) {
            return false;
        }

        // Case 2: Found same opening tag at same indent – allow insertion
        if (openingPattern.test(nextLine) && nextIndent === currentIndent) {
            break; // Allow adding, since a new opening started
        }
    }

    return true;
}

function indentationFor(lineText) {
    const match = lineText.match(/^(\s*)/);
    return match ? match[1] : '';
}

function hasClosingTag(editor, fromLine, expectedClose) {
    const totalLines = editor.document.lineCount;
    for (let i = fromLine + 1; i < Math.min(fromLine + 100, totalLines); i++) {
        const text = editor.document.lineAt(i).text;
        if (text.trim().toUpperCase().startsWith(expectedClose.toUpperCase())) {
            return true;
        }
    }
    return false;
}
