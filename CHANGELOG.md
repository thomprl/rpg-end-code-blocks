# Change Log

All notable changes to the "rpg-end-code-blocks" extension will be documented in this file.
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

## [1.0.0]
- Initial release