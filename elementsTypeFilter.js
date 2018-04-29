const objectDef = "ObjectTypeDefinition";
const queryName = "Query";
const mutationName = "Mutation";
const interfaceDef = "InterfaceTypeDefinition";
const enumDef = "EnumTypeDefinition";
const unionDef = "UnionTypeDefinition";
const inputDef = "InputObjectTypeDefinition";
const scalarDef = "ScalarTypeDefinition";
const schemaDef = "SchemaDefinition";

/**
 * 
 * @param {DefinitionNode[]} elements 
 * @param {string} kind 
 */
function filterByKind(elements, kind){
    return elements[kind]||[];
}

function filterFactory(kind){
    return elements=>filterByKind(elements, kind);
}

function getOperationType(elements, name){
    let schema = filterByKind(elements, schemaDef).find(_=>true);
    if (!schema) return undefined;
    let operation = schema.operationTypes.
                            find(o=>o.operation.toLowerCase() === name);
    
    return operation? operation.type.name.value : undefined;
}

module.exports ={
    /**
    * @param {DefinitionNode[]} elements AST elements
    */ 
    Query: function(elements) {
        let queryType = getOperationType(elements, "query");
        return queryType
            ? [filterByKind(elements, objectDef)
                .filter(element=>element.name.value==queryType)
                .find(element=>true)]
            : [];
    },
    Mutation: function(elements) {
        let mutationType = getOperationType(elements, "mutation");
        return mutationType
            ? [filterByKind(elements, objectDef)
                .filter(element=>element.name.value==mutationType)
                .find(element=>true)]
            : [];
    },
    Types: function(elements) {
        let queryType = getOperationType(elements, "query");
        let mutationType = getOperationType(elements, "mutation");
        return filterByKind(elements, objectDef)
                .filter(
                    element=>element.name.value!=queryType && 
                    element.name.value!=mutationType);
    },
    Interfaces: filterFactory(interfaceDef),
    Enums: filterFactory(enumDef),
    Unions: filterFactory(unionDef),
    "Input Types": filterFactory(inputDef),
    Scalars: filterFactory(scalarDef)
}