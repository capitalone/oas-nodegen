<a name="Generator"></a>

## Generator
**Kind**: global class  

* [Generator](#Generator)
    * [new Generator(config)](#new_Generator_new)
    * [.configure(config)](#Generator+configure) ⇒
    * [.addIgnoredOperations(operationNames)](#Generator+addIgnoredOperations) ⇒
    * [.addIgnoredParameters(parameterNames)](#Generator+addIgnoredParameters) ⇒
    * [.setModules(parameters)](#Generator+setModules) ⇒
    * [.use(moduleNamesOrObjects)](#Generator+use) ⇒
    * [.emit(phase, event, data)](#Generator+emit) ⇒
    * [.on(phase, event, data)](#Generator+on) ⇒
    * [.onPrepare(event, listener)](#Generator+onPrepare) ⇒
    * [.onDecorate(event, listener)](#Generator+onDecorate) ⇒
    * [.onFinalize(event, listener)](#Generator+onFinalize) ⇒
    * [.write(event, data)](#Generator+write) ⇒
    * [.onWrite(event, listener)](#Generator+onWrite) ⇒
    * [.process(specs, references)](#Generator+process)
    * [.groupOperation(operation)](#Generator+groupOperation) ⇒
    * [.groupSort(group)](#Generator+groupSort) ⇒
    * [.operationSort(operation)](#Generator+operationSort) ⇒

<a name="new_Generator_new"></a>

### new Generator(config)
Represents a Generator


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The configuration object (optional) |

<a name="Generator+configure"></a>

### generator.configure(config) ⇒
Adds configuration properties

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The configuration object |

<a name="Generator+addIgnoredOperations"></a>

### generator.addIgnoredOperations(operationNames) ⇒
Adds known ignored operation names

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| operationNames | <code>Array.&lt;string&gt;</code> | The list of operation names |

<a name="Generator+addIgnoredParameters"></a>

### generator.addIgnoredParameters(parameterNames) ⇒
Adds known ignored parameters names

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| parameterNames | <code>Array.&lt;string&gt;</code> | The list of parameter names |

<a name="Generator+setModules"></a>

### generator.setModules(parameters) ⇒
Sets the internal Modules object to use for resolving modules

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| parameters | <code>Array.&lt;string&gt;</code> | The list of parameter names |

<a name="Generator+use"></a>

### generator.use(moduleNamesOrObjects) ⇒
Loads modules and their dependencies

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| moduleNamesOrObjects | <code>Array.&lt;string&gt;</code> &#124; <code>Array.&lt;object&gt;</code> | Module objects or names to load |

<a name="Generator+emit"></a>

### generator.emit(phase, event, data) ⇒
Emits an event for a given specification scope.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| phase | <code>string</code> | The phase name |
| event | <code>string</code> | The event name |
| data | <code>object</code> | The data object to emit |

<a name="Generator+on"></a>

### generator.on(phase, event, data) ⇒
Registers a listener for a given phase and event.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| phase | <code>string</code> | The phase name |
| event | <code>string</code> | The event name |
| data | <code>object</code> | The data object to emit |

<a name="Generator+onPrepare"></a>

### generator.onPrepare(event, listener) ⇒
Shorthand method to register a listener for 'prepare' phase and given event.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | The event name |
| listener | <code>function</code> | The callback listener function |

<a name="Generator+onDecorate"></a>

### generator.onDecorate(event, listener) ⇒
Shorthand method to register a listener for 'decorate' phase and given event.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | The event name |
| listener | <code>function</code> | The callback listener function |

<a name="Generator+onFinalize"></a>

### generator.onFinalize(event, listener) ⇒
Shorthand method to register a listener for 'finalize' phase and given event.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | The event name |
| listener | <code>function</code> | The callback listener function |

<a name="Generator+write"></a>

### generator.write(event, data) ⇒
Emits a write event

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | The event name |
| data | <code>object</code> | The data to write |

<a name="Generator+onWrite"></a>

### generator.onWrite(event, listener) ⇒
Shorthand method to register a write listener for given event.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: same instance to allow chaining  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | The event name |
| listener | <code>function</code> | The callback listener function |

<a name="Generator+process"></a>

### generator.process(specs, references)
Processes the specification.

**Kind**: instance method of <code>[Generator](#Generator)</code>  

| Param | Type | Description |
| --- | --- | --- |
| specs | <code>object</code> &#124; <code>Array.&lt;object&gt;</code> | One or many specifications loaded by the `Loader` |
| references | <code>object</code> | (Optional) A manually loaded set of references |

<a name="Generator+groupOperation"></a>

### generator.groupOperation(operation) ⇒
Internal hook that determines the resource and group names for grouping.
This method can be overriden with by custom logic.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: the resource and group names object.  

| Param | Type | Description |
| --- | --- | --- |
| operation | <code>object</code> | The operation object |

<a name="Generator+groupSort"></a>

### generator.groupSort(group) ⇒
Internal hook that returns a order index used to sort group names.
This method can be overriden with by custom logic.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: the sort index based on the group name  

| Param | Type | Description |
| --- | --- | --- |
| group | <code>string</code> | The group name |

<a name="Generator+operationSort"></a>

### generator.operationSort(operation) ⇒
Internal hook that returns a order index used to sort operations.
This method can be overriden with by custom logic.
This implementation sorts by length of the URI after variables are stripped out.

**Kind**: instance method of <code>[Generator](#Generator)</code>  
**Returns**: the sort index based on the operation  

| Param | Type | Description |
| --- | --- | --- |
| operation | <code>object</code> | The operation object |

