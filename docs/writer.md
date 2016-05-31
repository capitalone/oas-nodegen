<a name="Writer"></a>

## Writer(pathParts)
Constructor

**Kind**: global function  

| Param | Type |
| --- | --- |
| pathParts | <code>Array.&lt;string&gt;</code> | 


* [Writer(pathParts)](#Writer)
    * [.setLeadingFileComments(comments)](#Writer+setLeadingFileComments)
    * [.setTrailingFileComments(comments)](#Writer+setTrailingFileComments)
    * [.preventDeletionOf(pathsToPrevent)](#Writer+preventDeletionOf)
    * [.clean()](#Writer+clean)
    * [.write(path, filename, content)](#Writer+write)

<a name="Writer+setLeadingFileComments"></a>

### writer.setLeadingFileComments(comments)
Sets the contents to write to the beginning of a file when `write` is called.
E.g. legal banner.

**Kind**: instance method of <code>[Writer](#Writer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| comments | <code>string</code> | The leading file comments |

<a name="Writer+setTrailingFileComments"></a>

### writer.setTrailingFileComments(comments)
Sets the contents to write to the end of a file when `write` is called.
E.g. legal footer

**Kind**: instance method of <code>[Writer](#Writer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| comments | <code>string</code> | The trailing file comments |

<a name="Writer+preventDeletionOf"></a>

### writer.preventDeletionOf(pathsToPrevent)
Adds items to the list of file and folder names to prevent deleting.

**Kind**: instance method of <code>[Writer](#Writer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| pathsToPrevent | <code>Array.&lt;string&gt;</code> | The paths to add to the internal prevention list |

<a name="Writer+clean"></a>

### writer.clean()
Recursively cleans the base directory

**Kind**: instance method of <code>[Writer](#Writer)</code>  
<a name="Writer+write"></a>

### writer.write(path, filename, content)
Writes the contents of a string to a path and file

**Kind**: instance method of <code>[Writer](#Writer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>Array.&lt;string&gt;</code> | The path to write to |
| filename | <code>string</code> | The filename to create/replace |
| content | <code>string</code> | The file content |

