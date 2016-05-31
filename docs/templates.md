<a name="Templates"></a>

## Templates
**Kind**: global class  

* [Templates](#Templates)
    * [new Templates(config)](#new_Templates_new)
    * [.setDefaultOptions(defaultOptions)](#Templates+setDefaultOptions) ⇒
    * [.registerLibrary(library)](#Templates+registerLibrary) ⇒
    * [.registerEngineDirectory(path)](#Templates+registerEngineDirectory) ⇒
    * [.registerEngine(path)](#Templates+registerEngine) ⇒
    * [.registerTemplateDirectory(path)](#Templates+registerTemplateDirectory) ⇒
    * [.compileFromSource(engineName, source, options)](#Templates+compileFromSource) ⇒
    * [.compileFromFile(templateFile, options)](#Templates+compileFromFile) ⇒

<a name="new_Templates_new"></a>

### new Templates(config)
Represents a Templates


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The configuration object (optional) |

<a name="Templates+setDefaultOptions"></a>

### templates.setDefaultOptions(defaultOptions) ⇒
Sets the default options passed to the compile function of each template engine.

**Kind**: instance method of <code>[Templates](#Templates)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| defaultOptions | <code>object</code> | The default options |

<a name="Templates+registerLibrary"></a>

### templates.registerLibrary(library) ⇒
Registers a single library containing its own template engine
directories, template engines, and template directories.

**Kind**: instance method of <code>[Templates](#Templates)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| library | <code>object</code> | The library object |

<a name="Templates+registerEngineDirectory"></a>

### templates.registerEngineDirectory(path) ⇒
Registers an engine directory.

**Kind**: instance method of <code>[Templates](#Templates)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>Array.&lt;string&gt;</code> | The engine directory path |

<a name="Templates+registerEngine"></a>

### templates.registerEngine(path) ⇒
Registers a single engine.

**Kind**: instance method of <code>[Templates](#Templates)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>Array.&lt;string&gt;</code> &#124; <code>object</code> | The engine path or object |

<a name="Templates+registerTemplateDirectory"></a>

### templates.registerTemplateDirectory(path) ⇒
Registers a template directory.

**Kind**: instance method of <code>[Templates](#Templates)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>Array.&lt;string&gt;</code> | The template directory path |

<a name="Templates+compileFromSource"></a>

### templates.compileFromSource(engineName, source, options) ⇒
Compiles a template from source

**Kind**: instance method of <code>[Templates](#Templates)</code>  
**Returns**: the compile template function  

| Param | Type | Description |
| --- | --- | --- |
| engineName | <code>string</code> | The engine name to lookup |
| source | <code>string</code> | The template source |
| options | <code>object</code> | (Optional) The template options |

<a name="Templates+compileFromFile"></a>

### templates.compileFromFile(templateFile, options) ⇒
Compiles a template from a file

**Kind**: instance method of <code>[Templates](#Templates)</code>  
**Returns**: the compile template function  

| Param | Type | Description |
| --- | --- | --- |
| templateFile | <code>string</code> | The template file to compile |
| options | <code>object</code> | (Optional) The template options |

