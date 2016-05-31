## Functions

<dl>
<dt><a href="#getSuccessResponse">getSuccessResponse(operation)</a> ⇒</dt>
<dd><p>Returns the response for either 200 or 201 response codes.</p>
</dd>
<dt><a href="#translate">translate(obj, spec, references)</a> ⇒</dt>
<dd><p>Translates a value into a lookup table.</p>
</dd>
<dt><a href="#resolveReference">resolveReference(obj, spec, references)</a> ⇒</dt>
<dd><p>Resolves references to other objects in the spec or external specs.</p>
</dd>
<dt><a href="#getReferenceName">getReferenceName($ref)</a> ⇒</dt>
<dd><p>Returns the last section of a JSON reference path.</p>
</dd>
<dt><a href="#extractModelName">extractModelName($ref)</a> ⇒</dt>
<dd><p>Extracts the model name from a JSON reference path.</p>
</dd>
<dt><a href="#getMimeType">getMimeType(array)</a> ⇒</dt>
<dd><p>Retreives the first mime type of a consumes or produces array.</p>
</dd>
<dt><a href="#sortKeys">sortKeys(object)</a> ⇒</dt>
<dd><p>Recreates an object with the keys sorted by their name (case insensitive).</p>
</dd>
<dt><a href="#capitalize">capitalize(string)</a> ⇒</dt>
<dd><p>Capitalizes a string</p>
</dd>
<dt><a href="#uncapitalize">uncapitalize(string)</a> ⇒</dt>
<dd><p>Uncapitalizes a string</p>
</dd>
<dt><a href="#random">random(low, high)</a> ⇒</dt>
<dd><p>Generates a random number within a given range</p>
</dd>
</dl>

<a name="getSuccessResponse"></a>

## getSuccessResponse(operation) ⇒
Returns the response for either 200 or 201 response codes.

**Kind**: global function  
**Returns**: the response for 200 or 201 if found, null otherwise  

| Param | Type | Description |
| --- | --- | --- |
| operation | <code>object</code> | The operation object |

<a name="translate"></a>

## translate(obj, spec, references) ⇒
Translates a value into a lookup table.

**Kind**: global function  
**Returns**: the translated value if found, otherwise the defaultValue if specified, or input value.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | The current reference object to resolve |
| spec | <code>object</code> | The current specification object |
| references | <code>object</code> | The references lookup object |

<a name="resolveReference"></a>

## resolveReference(obj, spec, references) ⇒
Resolves references to other objects in the spec or external specs.

**Kind**: global function  
**Returns**: the object that contains the referenced object and spec.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | The current reference object to resolve |
| spec | <code>object</code> | The current specification object |
| references | <code>object</code> | The references lookup object |

<a name="getReferenceName"></a>

## getReferenceName($ref) ⇒
Returns the last section of a JSON reference path.

**Kind**: global function  
**Returns**: the referenced object's name  

| Param | Type | Description |
| --- | --- | --- |
| $ref | <code>object</code> | The reference path value |

<a name="extractModelName"></a>

## extractModelName($ref) ⇒
Extracts the model name from a JSON reference path.

**Kind**: global function  
**Returns**: the referenced object's model name  

| Param | Type | Description |
| --- | --- | --- |
| $ref | <code>object</code> | The reference path value |

<a name="getMimeType"></a>

## getMimeType(array) ⇒
Retreives the first mime type of a consumes or produces array.

**Kind**: global function  
**Returns**: mime type if the array is populated, a default mime type otherwise  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>Array.&lt;string&gt;</code> | The consumes or produces array |

<a name="sortKeys"></a>

## sortKeys(object) ⇒
Recreates an object with the keys sorted by their name (case insensitive).

**Kind**: global function  
**Returns**: a new object with sorted keys  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>object</code> | The object to sort |

<a name="capitalize"></a>

## capitalize(string) ⇒
Capitalizes a string

**Kind**: global function  
**Returns**: the capitalized string value  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The string to capitalize |

<a name="uncapitalize"></a>

## uncapitalize(string) ⇒
Uncapitalizes a string

**Kind**: global function  
**Returns**: the uncapitalized string value  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The string to uncapitalize |

<a name="random"></a>

## random(low, high) ⇒
Generates a random number within a given range

**Kind**: global function  
**Returns**: the randomly generated number  

| Param | Type | Description |
| --- | --- | --- |
| low | <code>number</code> | The minimum value |
| high | <code>number</code> | The maximum value |

