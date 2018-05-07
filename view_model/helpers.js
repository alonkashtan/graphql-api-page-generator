const graphql = require('graphql');

/**
 * Returns an object that contains all the arguments present on a directive in its AST branch
 * as keys, and their values as value.
 * @param {graphql.DocumentNode} directive the AST branch of a directive
 * @returns {Object}
 */
function directiveToArgs(directive){
    let args = {};
    directive.arguments.forEach(arg => {
        args[arg.name.value] = arg.value.value;
    });
    return args;
}

module.exports = {
    /**
     * Returns deprecation reason or false if not.
     * 
     * @param {graphql.GraphQLNamedType} itemSchema the node's schema
     * @param {string} kind kind of node (e.g. Type/Scalar/Object etc). Used for default deprecation message
     * @returns {(string|boolean)} a string describing the reason that this node is deprecated or false if not deprecated.
     */
    deprecated: function(itemSchema, kind) {
        let deprecated = this.getDirective(itemSchema, "deprecated");
        if (!deprecated) return false;

        return deprecated.reason || 'This ' + kind + ' is deprecated';
    },
    /**
     * Returns the arguments of a directive if it exists, or false if not.
     * 
     * @param {graphql.GraphQLNamedType} itemSchema the node's schema
     * @param {string} directiveName the desired directive's name
     * @returns {(object|boolean)} the arguments of the directive, or false if directive not exists.
     */
    getDirective: function(itemSchema, directiveName){
        if (!itemSchema.astNode) return false; // this happens in built-in scalars, such as Int and Float

        let directive = itemSchema.astNode.directives.find(dir=>dir.name.value.toLowerCase() === directiveName.toLowerCase());
        if (!directive) return false;
        
        return directiveToArgs(directive);
    },
    /**
     * Returns the arguments of all instances of directive if any, or false if not.
     * 
     * @param {graphql.GraphQLNamedType} itemSchema the node's schema
     * @param {string} directiveName the desired directive's name
     * @returns {(object[]|boolean)} the arguments of the directive, or false if directive not exists.
     */
    getDirectives: function(itemSchema, directiveName){
        if (!itemSchema.astNode) return false; // this happens in built-in scalars, such as Int and Float
        let directives = itemSchema.astNode.directives.filter(dir=>dir.name.value.toLowerCase() === directiveName.toLowerCase());
        if (!directives || directives.length == 0) return false;
        
        return directives.map(directive => directiveToArgs(directive));
    },
    /**
     * Updates all the properties of object prototype (that includes class getters/setters) to be enumerable.
     */
    makeGettersEnumerable: function(obj){
        let prototype = Object.getPrototypeOf(obj);
        if (!prototype || prototype.hasOwnProperty('hasOwnProperty')) return;

        let props = Object.getOwnPropertyNames(prototype);
        for (let i in props){
            let prop = props[i];
            Object.defineProperty(prototype, prop, {enumerable: true});
        }
        
        this.makeGettersEnumerable(prototype);
    },
    /**
     * Flattens an object that is used as a map to an array of values, skipping any key that starts with '__' (i.e. private field).
     * @param {*} map the map
     * @returns {*[]} the values of the maps.
     */
    mapToArray: function(map){
        let keys = Object.getOwnPropertyNames(map).filter(name => !name.startsWith('__'));
        return keys.map(name => map[name]);
    }
}