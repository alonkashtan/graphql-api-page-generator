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
     * @param {DocumentNode} ast the node's AST schema
     * @param {string} kind kind of node (e.g. Type/Scalar/Object etc). Used for default deprecation message
     * @returns {(string|boolean)} a string describing the reason that this node is deprecated or false if not deprecated.
     */
    deprecated: function(ast, kind) {
        let deprecated = this.getDirective(ast, "deprecated");
        if (!deprecated) return false;

        return deprecated.reason || 'This ' + kind + ' is deprecated';
    },
    /**
     * Returns the arguments of a directive if it exists, or false if not.
     * 
     * @param {DocumentNode} ast the node's AST schema
     * @param {string} directiveName the name of the directive to look for
     * @returns {(object|boolean)} the arguments of the directive, or false if directive not exists.
     */
    getDirective: function(ast, directiveName){
        let directive = ast.directives.find(dir=>dir.name.value.toLowerCase() === directiveName.toLowerCase());
        if (!directive) return false;
        
        return directiveToArgs(directive);
    },
    /**
     * Returns the arguments of all instances of directive if any, or false if not.
     * 
     * @param {DocumentNode} ast the node's AST schema
     * @param {string} directiveName the name of the directive to look for
     * @returns {(object[]|boolean)} the arguments of the directive, or false if directive not exists.
     */
    getDirectives: function(ast, directiveName){
        let directives = ast.directives.filter(dir=>dir.name.value.toLowerCase() === directiveName.toLowerCase());
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
    }
}