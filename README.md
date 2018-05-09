# GraphQL API Page Generator
A npm package and command line tool for generating an API page from a GraphQL schema that is intended for public display.

[Directives](#supported-directives) can be used for extra information about the schema. 

HTML and Markdown descriptions [are supported](#html--markdown-description-support)! 

![Screenshot](/docs/screenshot.png)

## Installation
To install as NodeJS npm package:

    npm install graphql-api-page-generator

To install as command line tool:

    npm install -g graphql-api-page-generator

To see all the options and verify installation:

    gqlapi --help

## Usage - NodeJS
#### Example 1: Generating an API page from GraphQL schema (text)
<small>Examples of real schema files can be found under [/examples](https://github.com/alonkashtan/graphql-api-page-generator/tree/master/examples) folder. It includes one example of a schema that is using the features of this generator, and the schema of [GitHub's API](https://developer.github.com/v4/), which was obtained via introspection <small>(on April 24th 2018)</small></small>
```javascript
const generator = require('graphql-api-page-generator')

// GraphQL schema as text. Good chances you will actually read this from a file.
let schema = `
type Student {
    name: String @length(min: 2, max: 5)
    age: Int @range(max: 120)
}
type Query {
    students: [Student] @length(max: 1000)
}
`

generator.buildAPIPage(schema, "Students API", "An API to get all students.")
    .then(html => /* do something with the HTML text */)
    .catch(reason => /* handle failure */);
```

#### Example 2: Generating an API page from a live GraphQL server (via introspection)
```javascript
const generator = require('graphql-api-page-generator')

let query = graphql.introspectionQuery;
let introspectionResult = /* response body for a POST request to the server with 'query' as a body */

let schema=graphql.buildClientSchema(introspectionResult.data);
apiPageBuilder.buildAPIPage(schema, "Students API", "An API to get all students.")
    .then(html => /* do something with the HTML text */)
    .catch(reason => /* handle failure */);
});
```

## Usage - Command line
### Generating an API page from a schema file
**GraphQL API Page Generator** supports the GraphQL SDL of [graphql.js](https://github.com/graphql/graphql-js)

    $> gqlapi  from-file --help
    gqlapi from-file <outputfile> <path> <apiname> [description]

    Writes API as HTML from a file to the given output file

    Positionals:
    outputfile   name (and path) of file to which the API HTML will be saved
                                                    [required] [default: "API.html"]
    path         the path to the graphql schema file (in graphql.js SDL format)
                                                                [string] [required]
    apiname      name of the API                               [string] [required]
    description  description of the API                                   [string]

    Options:
    --version  Show version number                                       [boolean]
    --help     Show help                                                 [boolean]

for example:

    gqlapi from-file out.html schema.graphql "Example API" "This is a description of a great API"

### Generating an API page from a live GraphQL server (via introspection)
**GraphQL API Page Generator** can create an API page for any live GraphQL server by sending introspection query.

    $> gqlapi from-url <outputfile> <url> <apiname> [description]

    Writes API as HTML from a live GraphQL server (via introspection) to the given
    output file

    Positionals:
    outputfile   name (and path) of file to which the API HTML will be saved
                                                    [required] [default: "API.html"]
    url          the path to the graphql file or the URL to the GraphQL service
                                                                [string] [required]
    apiname      name of the API                               [string] [required]
    description  description of the API                                   [string]

    Options:
    --version  Show version number                                       [boolean]
    --help     Show help                                                 [boolean]

For example:

    gqlapi from-url out.html "http://graphql.communitygraph.org/graphql/" "Example API" "This is a description of a great API"

## HTML & Markdown description support
The description will be rendered as Markdown (with [markdown-it](https://github.com/markdown-it/markdown-it)). 

The description of every item kind may contain HTML tags that will be embedded into the generated HTML file.
Note, however, that the HTML is sanitized for security purpose.
For a complete list of allowed tags and attributes, see the [sanitize-html docs](https://github.com/punkave/sanitize-html#what-are-the-default-options).

## Supported directives
**GraphQL API Page Generator** is supporting directives that allows the schema publisher to provide extra information about the API behavior.
### The `@deprecated` directive
```GraphQL
directive @deprecated(reason: String) on 
    SCALAR|OBJECT|FIELD_DEFINITION|ARGUMENT_DEFINITION|
    INTERFACE|UNION|ENUM|ENUM_VALUE|INPUT_OBJECT|
    INPUT_FIELD_DEFINITION
```
Used to indicate deprecation, with an optional reason. Can be used on type (any kind), field, argument or enum value.

<small> ***Note**: some GraphQL libraries declare deprecated to be used on less schema parts (only field definition for example). Although this **deprecated** message will not show up in introspection (and therefore neither in GraphiQL, you can still declare it in the schema file and **GraphQL API Page Generator** will still process this directive wherever it appears, given the schema file. However, this directive will not appear if schema is obtained via introspection.* </small>

**Example:**
```GraphQL
type Student @deprecated (reason: "University is closing") {
    "The name of the student"
    name: String! @deprecated(reason: "Use 'full name' instead") 
    "Full name"
    fullName: String 
    "The average grade"
    grade(onlyLastYear: Float @deprecated(reason: "not supported anymore")): Int
}
```
Result: <br/>
![Deprecated screenshot](/docs/screenshot-deprecated.png)
### The `@range` directive
```GraphQL
directive @range(min: Float = -∞, max: Float = ∞, maxPrecision: Float) on 
    FIELD_DEFINITION|ARGUMENT_DEFINITION|INPUT_FIELD_DEFINITION
```
Used to describe the valid range of a numerical field or argument. If `min` is not provided, it is considered to be -∞ , if `max` is not defined it is considered to be ∞. Both `min` and `max` are regarded as inclusive.

The maximal precision is a number that represents the smallest step acceptable. Typically it will be in a form such as 0.01

<small> ***Note**: some GraphQL libraries do not support custom directives. **GraphQL API Page Generator** will still process this directive wherever it appears, given the schema file. However, this directive will not appear if schema is obtained via introspection.* </small>

**Example:**
```GraphQL
type Student {
    "The name of the student"
    friends(
        "get a limited number of friends"
        first: Int! @range(min: 1, maxPrecision: 0.1)
    ): String!
    "The average grade"
    grade: Int @range(min: 0, max: 100)
}
```
Result: <br/>
![Deprecated screenshot](/docs/screenshot-range.png)
### The `@length` directive
```GraphQL
directive @length(min: Float = 0, max: Float = ∞, level: Int = 1) on 
    FIELD_DEFINITION|ARGUMENT_DEFINITION|INPUT_FIELD_DEFINITION
```
Used to describe the valid length of field or argument that are **`array`** or **`string`**. If `min` is not provided, it is considered to be 0 , if `max` is not defined it is considered to be ∞. Both `min` and `max` are regarded as inclusive.

`level` is used for nested objects tha has length. For example, a field of type `[[int]]`, in which we would want to describe length limit of outer and inner arrays, or field of type `[string]` in which we would like to describe the length of both the array and the string.<br/>
The `level` is ordering the length definitions from outer to inner, e.g. in this definition: 
```
nameLists: [[string]] 
    @length(max: 3, level:1) 
    @length(min: 1, max: 8, level:2) 
    @length(max:5, level: 3)
```
we have an array that holds up to 3 arrays, each one with 1 to 8 strings in length of up to 5 characters.<br/>
If `level` is not defined it is considered to be 1. `@length` directive with equal `level` are sorted according to order of appearance.

<small> ***Note**: some GraphQL libraries do not support custom directives. **GraphQL API Page Generator** will still process this directive wherever it appears, given the schema file. However, this directive will not appear if schema is obtained via introspection.* </small>

**Example:**
```GraphQL
type Query {
    "get all stidents"
    students(
        "only those that contains this string"
        contains: String @length(min: 1, max: 5)
    ): [Student] @length
    "Get all classes"
    classes: [Class] @length(min: 0, max: 100)
    otherNames: [String] 
        @length(max:8, level: 1) 
        @length(min: 2, max: 20, level: 2)
}
```
Result: <br/>
![Deprecated screenshot](/docs/screenshot-length.png)

### The `@mask` directive
```GraphQL
directive @mask(regExp: String!) on 
    FIELD_DEFINITION|ARGUMENT_DEFINITION|INPUT_FIELD_DEFINITION
```
Used to describe the valid values of a string field or argument.

<small>***Note**: some GraphQL libraries do not support custom directives. **GraphQL API Page Generator** will still process this directive wherever it appears, given the schema file. However, this directive will not appear if schema is obtained via introspection.*</small>

**Example:**
```GraphQL
type Student {
    "Identifier of the student as supplied by the school"
    id: String @mask(regExp: "^stud[0-9]{1,10}$")
}
```
Result: <br/>
![Deprecated screenshot](/docs/screenshot-mask.png)
