# rpg-end-code-blocks
![RPG End Code Blocks]([http://url/to/img.png](https://github.com/thomprl/rpg-end-code-blocks/blob/release/images/begend.png))
RPG End Code Blocks - This extension will auto add ending code blocks once you press enter for a RPGLE program.  

For example if you type If x=y; and press enter it will automatically add the matching EndIf; to the code and 
move the cursor to the second line indented based on VSCodes indentions. 

## Features

There are default code blocks setup but if you wish to customize them you can added this to the settings.json file and customize them as you see fit.

```
    "rpg-end-code-blocks.openings": [
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
