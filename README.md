# rpg-end-code-blocks
![RPG End Code Blocks](https://github.com/thomprl/rpg-end-code-blocks/blob/release/images/begend.png?raw=true)

RPG End Code Blocks - This extension will auto add ending code blocks once you press enter for a RPGLE program.  

For example if you type If x=y; and press enter it will automatically add the matching EndIf; to the code and 
move the cursor to the second line indented based on VSCodes indentions. 

## Features

There are default code blocks setup but if you wish to customize them you can added this to the settings.json file and customize them as you see fit.

```
    "rpg-end-code-blocks.openings": [
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
    ]
```

## Requirements
This will only work with ILE RPGLE Free Form 


## Known Issues
Sometimes it does not detect you are entering a code block.  I think it depends on how the line started.

Also the new SELECT x WHEN-IS clause will not work only SELECT; will work.  It would add a ENDSL; on a EXEC SQL SELECT statement so this was a compromise.
## Release Notes

### 1.0.0
Initial release

Github: https://github.com/thomprl/rpg-end-code-blocks

**Enjoy!**
