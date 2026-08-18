# Change Log

All notable changes to the "rpg-end-code-blocks" extension will be documented in this file.
## [1.0.9]
- Fixed the MONITOR block: the `On-Error` and `EndMon` lines were not indenting correctly, and an existing `On-Error`/`EndMon` block was not being detected, so a duplicate could get added. Replaced the old `"close": "On-Error;\nEndMon"` trick with a new optional `"middle"` property so both lines are generated and aligned correctly.
- Added a new `rpg-end-code-blocks.lookAheadLines` setting (default 20) so the number of lines scanned ahead for an existing end block is configurable instead of hardcoded.
- The `openings` and `lookAheadLines` settings now take effect immediately when changed — no more reloading the window.
- If you have a customized `openings` setting saved in your settings.json, the extension will now detect when it's out of date with a new version's defaults and ask if you'd like to overwrite it.

If you have previously customized the settings.json file you will need to make the following changes to your json file (or accept the prompt shown above to have it done for you):

```
    "rpg-end-code-blocks.openings": [
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
    ]
```

## [1.0.8]
- Found a issue with ELSEIF statements. The extension was detecting the IF statement and adding an EndIf block but it should not have been doing that for ELSEIF statements.  Updated the regex to look for IF statements that are not preceeded by ELSE. If you have previously customized the settings.json file you will need to make the 
following changes to your json file.

```
    "rpg-end-code-blocks.openings": [
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
      { "open": "MONITOR\\s*;", "close": "EndMon" },
      { "open": "SELECT\\s*;", "close": "EndSl" }
    ]
```


## [1.0.7]
- Registered the extension settings so that it will default the settings in settings.json in VSCode.
- Fixed various issues when the begin block was not be detected correctly if there was a comment 
at the beginning of the line (ie columns 1-5) before the opening block statement. 
If you have previously customized the settings.json file you will need to make the 
following changes to your json file.

```
    "rpg-end-code-blocks.openings": [
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
      { "open": "IF\\b", "close": "EndIf" },
      { "open": "MONITOR\\s*;", "close": "EndMon" },
      { "open": "SELECT\\s*;", "close": "EndSl" }
    ]
```

## [1.0.6]
- Forgot to update the CHANGELOG.MD file.  Bumping to version 1.0.6.

## [1.0.5]
- Fixed issue with end block being on the same line.
- Also make sure cursor is past the ; before adding a new line.

## [1.0.4]
- Fixed a issue if it saw another If/EndIf block before the 20 lines it was not adding the end block.  Made a 
change that should detect if a begin block happens prior to the 20 lines with the same block type if should add 
a new end block. Again this isn't perfect and relies on the code to be formmatted correctly.

## [1.0.3]
- Fixed a small issue that could happen in fixed format RPG code. This extension should only work for **free format code 

## [1.0.2]
- Updated CHANGELOG and README
- It will look at the next 20 lines to see if if finds a end block on the same indention level.  This should stop some of the auto adding of a end block when you just need to make a quick change to a If you just added. Also changed the logic for the regex as well to try and help the detection of a begin block.

## [1.0.1]
- Improved the logic for deciding if a end block is needed. 

### 1.0.0
Initial release
