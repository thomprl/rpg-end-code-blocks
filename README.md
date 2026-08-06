# rpg-end-code-blocks
![RPG End Code Blocks](https://github.com/thomprl/rpg-end-code-blocks/blob/release/images/begend.png?raw=true)

RPG End Code Blocks - This extension will auto add ending code blocks once you press enter for a RPGLE program.  

For example if you type If x=y; and press enter it will automatically add the matching EndIf; to the code and move the cursor to the second line indented based on VSCodes indentions. 

## Features

These are default code blocks settings but if you wish to customize them (Change the close casing) you can added this to the settings.json file and customize them as you see fit.

```
    "rpg-end-code-blocks.openings": [
      {"open": "BEGSR\\b", "close": "EndSr" },
      {"open": "DCL-DS\\b", "close": "End-Ds" },
      {"open": "DCL-ENUM\\b", "close": "End-Enum" },
      {"open": "DCL-PR\\b", "close": "End-Pr" },
      {"open": "DCL-PI\\b", "close": "End-Pi" },
      {"open": "DCL-PROC\\b", "close": "End-Proc" },
      {"open": "DOW\\b", "close": "EndDo" },
      {"open": "DOU\\b", "close": "EndDo" },
      {"open": "FOR\\b", "close": "EndFor" },
      {"open": "FOR-EACH\\b", "close": "EndFor" },
      {"open": "(?<!ELSE)IF\\b", "close": "EndIf" },
      {"open": "MONITOR\\s*;", "close": "On-Error;\nEndMon" },
      {"open": "SELECT\\s*;", "close": "EndSl" }
    ]
```

## Requirements
This will only work with ILE RPGLE Free Format code.   

## Known Issues
- My extension and Bob Cozzi's RPGIV to RPG Free Conversion Extension can interfere with each other. I had to disable smart enter in the settings.json file. ```"rpgiv2free.enableRPGSmartEnter": "disable"```.  From what I can tell there is not a way to specify the priority of which extension runs first and when his runs it takes over the enter key. You can set his enableRPGSmartEnter to only FIXED format but if you sprinkle any free form code in the middle of your fixed format code it may not work.

- Also the new ```SELECT x; WHEN-IS 'value'``` clause will not work. Only ```SELECT;``` will work. I tried to come up with a way but it would add a ```ENDSL;``` on a ```EXEC SQL SELECT``` statement for example.  

- It will not add the end block if the line is a multiline statement.  It specifically looks for the ; at the end of the line before adding the end block.
## GitHub Repo

Github: https://github.com/thomprl/rpg-end-code-blocks

**Enjoy!**
