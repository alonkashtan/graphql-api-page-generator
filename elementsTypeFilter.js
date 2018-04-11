const objectDef = "ObjectTypeDefinition";
const queryName = "Query";
const mutationName = "Mutation";
const interfaceDef = "InterfaceTypeDefinition";
const enumDef = "EnumTypeDefinition";
const unionDef = "UnionTypeDefinition";
const inputDef = "InputObjectTypeDefinition";
const scalarDef = "ScalarTypeDefinition";

/**
 * 
 * @param {DefinitionNode[]} elements 
 * @param {string} kind 
 */
function filterByKind(elements, kind){
    //return elements.filter(element=>elements.kind==kind);
    return elements[kind]||[];
}

function filterFactory(kind){
    return elements=>filterByKind(elements, kind);
}

module.exports ={
    /**
    * @param {DefinitionNode[]} elements AST elements
    */ 
    Query: function(elements) {
        return [filterByKind(elements, objectDef)
                .filter(element=>element.name.value==queryName)
                .find(element=>true)];
    },
    Mutation: function(elements) {
        return [filterByKind(elements, objectDef)
                .filter(element=>element.name.value==mutationName)
                .find(element=>true)];
    },
    Types: function(elements) {
        return filterByKind(elements, objectDef)
                .filter(
                    element=>element.name.value!=mutationName && 
                    element.name.value!=queryName);
    },
    Interfaces: filterFactory(interfaceDef),
    Enums: filterFactory(enumDef),
    Unions: filterFactory(unionDef),
    "Input Types": filterFactory(inputDef),
    Scalars: filterFactory(scalarDef)
}