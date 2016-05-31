<a name="ModuleRegistry"></a>

## ModuleRegistry
**Kind**: global class  

* [ModuleRegistry](#ModuleRegistry)
    * [new ModuleRegistry()](#new_ModuleRegistry_new)
    * [.registerLibrary(library)](#ModuleRegistry+registerLibrary) ⇒
    * [.registerModuleDirectory(path)](#ModuleRegistry+registerModuleDirectory) ⇒
    * [.registerModule(pathOrModule)](#ModuleRegistry+registerModule) ⇒
    * [.get(names)](#ModuleRegistry+get) ⇒ <code>Array.&lt;object&gt;</code>

<a name="new_ModuleRegistry_new"></a>

### new ModuleRegistry()
Represents a ModuleRegistry

<a name="ModuleRegistry+registerLibrary"></a>

### moduleRegistry.registerLibrary(library) ⇒
Registers a library's modules

**Kind**: instance method of <code>[ModuleRegistry](#ModuleRegistry)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| library | <code>object</code> | The library to register |

<a name="ModuleRegistry+registerModuleDirectory"></a>

### moduleRegistry.registerModuleDirectory(path) ⇒
Registers a directory of modules

**Kind**: instance method of <code>[ModuleRegistry](#ModuleRegistry)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> &#124; <code>Array.&lt;string&gt;</code> | The path to scan |

<a name="ModuleRegistry+registerModule"></a>

### moduleRegistry.registerModule(pathOrModule) ⇒
Registers a single module

**Kind**: instance method of <code>[ModuleRegistry](#ModuleRegistry)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| pathOrModule | <code>string</code> &#124; <code>object</code> | The path or module object |

<a name="ModuleRegistry+get"></a>

### moduleRegistry.get(names) ⇒ <code>Array.&lt;object&gt;</code>
Returns modules (along with dependencies) to register

**Kind**: instance method of <code>[ModuleRegistry](#ModuleRegistry)</code>  
**Returns**: <code>Array.&lt;object&gt;</code> - The list of resolved modules  

| Param | Type | Description |
| --- | --- | --- |
| names | <code>string</code> &#124; <code>Array.&lt;string&gt;</code> | Names of the modules to return |

