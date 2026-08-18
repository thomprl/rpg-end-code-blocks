"use strict";
import * as vscode from "vscode";

// All openings are check for a space after before adding the cooresponding end except MONITOR and SELECT
// Define a default value for OPENINGS_RPG
const DEFAULT_OPENINGS_RPG = [
    { "open": "BEGSR\\b", "close": "EndSr" },
    { "open": "DCL-DS\\b", "close": "End-Ds" },
    { "open": "DCL-ENUM\\b", "close": "End-Enum" },        
    { "open": "DCL-PR\\b", "close": "End-Pr" },
    { "open": "DCL-PI\\b", "close": "End-Pi" },
    { "open": "DCL-PROC\\b", "close": "End-Proc" },
    { "open": "DOW\\b", "close": "EndDo" },
    { "open": "DOU\\b", "close": "EndDo" },
    { "open": "FOR\\b", "close": "EndFor" },
    { "open": "FOR-EACH\\b", "close": "EndFor" },
    { "open": "(?<!ELSE)IF\\b", "close": "EndIf" },
    { "open": "MONITOR\\s*;", "middle": "On-Error", "close": "EndMon" },
    { "open": "SELECT\\s*;", "close": "EndSl" }
];

// Default tab size used when editor options don't provide a numeric value
const DEFAULT_TAB_SIZE = 4;
// Tolerance (in visual columns) when comparing opening/closing column positions.
// Set to 0 to require exact column match; small non-equal columns should be treated
// as different levels (so an EndIf shifted by one column won't block insertion).
const MATCH_TOLERANCE = 0;

const LINE_PARSE_LIMIT = 100000;

// Default number of lines to scan ahead of an opening statement for an existing closing tag
const DEFAULT_LOOK_AHEAD_LINES = 20;

// Cached, user-configurable values. Populated on activation and kept in sync via
// onDidChangeConfiguration so hot-path code never has to read settings itself.
let OPENINGS_RPG = loadOpenings();
let LOOK_AHEAD_LINES = loadLookAheadLines();

function loadOpenings() {
    const config = vscode.workspace.getConfiguration().get("rpg-end-code-blocks.openings", DEFAULT_OPENINGS_RPG);
    // Convert string representations of regular expressions to RegExp objects
    return config.map(({ open, close, middle }) => ({
        open: new RegExp(open, "i"),
        close,
        middle
    }));
}

function loadLookAheadLines() {
    return vscode.workspace.getConfiguration().get("rpg-end-code-blocks.lookAheadLines", DEFAULT_LOOK_AHEAD_LINES);
}

const LAST_SEEN_VERSION_KEY = "rpg-end-code-blocks.lastSeenVersion";

export async function activate(context: vscode.ExtensionContext) {
	console.log("Activate rpg-end-code-blocks");
 	const enter = vscode.commands.registerCommand("rpg-end-code-blocks.enter", async () => {
        await rpgEndCodeBlocksEnter();
    });

    context.subscriptions.push(enter);

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("rpg-end-code-blocks.openings")) {
            try {
                OPENINGS_RPG = loadOpenings();
            } catch (e) {
                // Keep the previous, known-good openings if the new value has an invalid RegExp
                console.error("rpg-end-code-blocks: failed to reload 'openings' setting, keeping previous value", e);
            }
        }
        if (event.affectsConfiguration("rpg-end-code-blocks.lookAheadLines")) {
            LOOK_AHEAD_LINES = loadLookAheadLines();
        }
    }));

    await checkOpeningsDefaultsOnUpdate(context);
}

// Normalize an openings array for comparison: lowercase the open/close strings so
// differences in case alone don't register as a "real" difference.
function normalizeOpeningsForCompare(list) {
    return (list || []).map(({ open, close }) => ({
        open: String(open).toLowerCase(),
        close: String(close).toLowerCase()
    }));
}

function openingsEqual(a, b) {
    return JSON.stringify(normalizeOpeningsForCompare(a)) === JSON.stringify(normalizeOpeningsForCompare(b));
}

// When the extension updates to a new version, check whether the user has an explicit
// 'openings' override saved in settings.json that no longer matches the extension's
// current defaults, and offer to overwrite it with the new defaults.
async function checkOpeningsDefaultsOnUpdate(context: vscode.ExtensionContext) {
    const currentVersion = context.extension.packageJSON.version;
    const previousVersion = context.globalState.get(LAST_SEEN_VERSION_KEY);

    if (previousVersion === currentVersion) {
        return;
    }
    await context.globalState.update(LAST_SEEN_VERSION_KEY, currentVersion);

    const inspected = vscode.workspace.getConfiguration().inspect("rpg-end-code-blocks.openings");
    if (!inspected) {
        return;
    }

    // Prefer a workspace-level override over a global (user settings.json) one, since
    // workspace settings take precedence for this workspace.
    const override = inspected.workspaceValue !== undefined
        ? { value: inspected.workspaceValue, target: vscode.ConfigurationTarget.Workspace }
        : inspected.globalValue !== undefined
            ? { value: inspected.globalValue, target: vscode.ConfigurationTarget.Global }
            : undefined;

    if (!override || openingsEqual(override.value, DEFAULT_OPENINGS_RPG)) {
        return; // No override, or it already matches the current defaults.
    }

    const choice = await vscode.window.showInformationMessage(
        `RPG End Code Blocks was updated to v${currentVersion} and its default 'openings' patterns have changed since your settings.json was last saved. Overwrite your settings.json with the new defaults?`,
        "Overwrite", "Keep Mine"
    );

    if (choice === "Overwrite") {
        await vscode.workspace.getConfiguration().update("rpg-end-code-blocks.openings", DEFAULT_OPENINGS_RPG, override.target);
    }
}

async function rpgEndCodeBlocksEnter(calledWithModifier = false) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {return;} // Exit if no open text editor

    const lineNumber = editor.selection.active.line;
    const columnNumber = editor.selection.active.character;
    const lineText = editor.document.lineAt(lineNumber).text;

    if (editor.document.languageId.toLowerCase() !== "rpgle") {
        await linebreak(); // Default behavior for non-RPG files
        return;
    }
    
    let matchedOpening = OPENINGS_RPG.find(({ open }) => open.test(lineText));
    if (matchedOpening && shouldAddEnd(matchedOpening, editor, lineNumber, columnNumber)) {
        // Find the column position where the opening keyword starts
        const openingKeywordCol = findOpeningKeywordColumn(lineText, matchedOpening.open);
        await linebreakWithClosing(matchedOpening.close, lineText, openingKeywordCol, matchedOpening.middle);
    } else {
        await linebreak();
    }
}

async function linebreakWithClosing(closingTag, lineText, openingKeywordCol, middleTag) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {return;}
    // Insert the entire block in one edit and then set the selection to the blank content line.
    try {
        const currentLine = editor.selection.active.line;
        const insertPos = editor.document.lineAt(currentLine).range.end;

            // Determine tab size and indentation style from editor options
            const opts = editor.options;
            const tabSizeRaw = opts && opts.tabSize;
            const tabSize = typeof tabSizeRaw === 'number' ? Number(tabSizeRaw) : DEFAULT_TAB_SIZE;
            const insertSpaces = !!opts && !!opts.insertSpaces;

        // Compute visual columns for the opening keyword so we can align the closing tag
        const openingVisCol = getVisualColumn(lineText, openingKeywordCol, tabSize);

        // Content line should be indented one tab stop past the opening keyword visual column
        const contentVisCol = openingVisCol + tabSize;

        // Build indent strings that exactly reach the required visual columns.
        const contentIndent = buildIndentFromVisual(contentVisCol, tabSize, insertSpaces);
        // Force the closing indent to use spaces so the closing tag lines up exactly
        // with the opening keyword visual column even when it's not on a tab stop.
        const closingIndent = buildIndentFromVisual(openingVisCol, tabSize, true);

        const middleLine = middleTag ? `${closingIndent}${middleTag};\n` : '';
        const insertText = `\n${contentIndent}\n${middleLine}${closingIndent}${closingTag};`;

        await editor.edit((eb) => eb.insert(insertPos, insertText));

        // Place the selection on the blank content line after the inserted indent
        const blankLine = currentLine + 1;
        const newPos = new vscode.Position(blankLine, contentIndent.length);
        editor.selection = new vscode.Selection(newPos, newPos);
    } catch (e) {
        // Fallback: simple line break behavior
        await vscode.commands.executeCommand('lineBreakInsert');
    }
}

async function linebreak() {
    await vscode.commands.executeCommand("lineBreakInsert");
	await vscode.commands.executeCommand("cursorDown");
	//await vscode.commands.executeCommand("cursorLineStart");
}

function findOpeningKeywordColumn(lineText: string, openingPattern: RegExp): number {
    // Reset lastIndex in case a RegExp with the global flag is ever used.
    try {
        openingPattern.lastIndex = 0;
    } catch (e) {
        // ignore if not writable
    }

    // Use RegExp.exec to get the match index (start position of the keyword)
    const m = openingPattern.exec(lineText);
    if (!m) { return -1; }
    return typeof m.index === 'number' ? m.index : lineText.indexOf(m[0]);
}

// (removed) use regex exec positions directly for robust column detection

function getVisualColumn(lineText: string, index: number, tabSize: number) {
    // Compute visual column (taking tabs into account) for character index
    let col = 0;
    for (let i = 0; i < Math.min(index, lineText.length); i++) {
        const ch = lineText[i];
        if (ch === '\t') {
            const advance = tabSize - (col % tabSize || 0);
            col += advance;
        } else {
            col += 1;
        }
    }
    return col;
}

function buildIndentFromVisual(visualCols: number, tabSize: number, insertSpaces: boolean): string {
    // Construct a string of tabs and spaces (or spaces only) that occupies exactly
    // `visualCols` visual columns when rendered in the editor with the given tab size.
    if (visualCols <= 0) { return ''; }
    if (insertSpaces) {
        return ' '.repeat(visualCols);
    }
    const tabs = Math.floor(visualCols / tabSize);
    const spaces = visualCols - (tabs * tabSize);
    return '\t'.repeat(tabs) + ' '.repeat(spaces);
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
    const escapedClose = matchedOpening.close.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Find where the opening keyword starts in this line (raw char index)
    const openingKeywordCol = findOpeningKeywordColumn(lineText, openingPattern);
    if (openingKeywordCol < 0) {
        return false;
    }

    // Determine tab size from editor options (fallback to DEFAULT_TAB_SIZE)
    const opts = editor.options;
    const tabSizeRaw = opts && opts.tabSize;
    const tabSize = typeof tabSizeRaw === 'number' ? Number(tabSizeRaw) : DEFAULT_TAB_SIZE;

    const openingVisCol = getVisualColumn(lineText, openingKeywordCol, tabSize);

    const maxLines = Math.min(document.lineCount, lineNumber + LOOK_AHEAD_LINES);

    // New check: if the same line already contains the corresponding closing tag,
    // do not add an end block. This handles cases like "IF ... EndIf;" on one line.
    try {
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

    // Check following lines to see if there's already a closing tag at the same column
    for (let i = lineNumber + 1; i < maxLines; i++) {
        const nextLine = document.lineAt(i).text;
        const trimmedUpper = nextLine.trim().toUpperCase();

        // Case 1: Found closing tag at the same column position – cancel
        if ((trimmedUpper === `${closingTag};` || trimmedUpper.startsWith(`${closingTag} `))) {
            // Check if this closing tag is at the same visual column as the opening keyword
            const closingKeywordMatch = nextLine.match(new RegExp(`\\b${escapedClose}\\b`, 'i'));
            if (closingKeywordMatch) {
                const closingKeywordCol = nextLine.indexOf(closingKeywordMatch[0]);
                const closingVisCol = getVisualColumn(nextLine, closingKeywordCol, tabSize);
                if (Math.abs(closingVisCol - openingVisCol) <= MATCH_TOLERANCE) {
                    return false;
                }
            }
        }

        // Case 2: Found same opening tag at the same column – allow insertion
        // Reset openingPattern.lastIndex before using it (safety for global regexes)
        try { openingPattern.lastIndex = 0; } catch (e) { /* ignore */ }
        const nextOpeningMatch = nextLine.match(openingPattern);
        if (nextOpeningMatch) {
            const nextOpeningCol = nextLine.indexOf(nextOpeningMatch[0]);
            const nextOpeningVis = getVisualColumn(nextLine, nextOpeningCol, tabSize);
            if (Math.abs(nextOpeningVis - openingVisCol) <= MATCH_TOLERANCE) {
                break; // Allow adding, since a new opening started at same level
            }
        }
    }

    return true;
}
