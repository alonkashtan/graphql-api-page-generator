const graphql = require('graphql');
const filter = require('../elementsTypeFilter')
const helpers = require('./helpers');
const TypeViewModel = require('./typeViewModel').TypeViewModel;
const InterfaceViewModel = require('./typeViewModel').InterfaceViewModel;
const ScalarViewModel = require('./typeViewModel').ScalarViewModel;
const EnumViewModel = require('./typeViewModel').EnumViewModel;
const UnionViewModel = require('./typeViewModel').UnionViewModel;
const InputViewModel = require('./typeViewModel').InputViewModel;

/**
 * View model that represents the GraphQL schema AST for the EJS generator.
 * The engine assumes that the names of the getters match the name of the properties of
 * elementsTypeFilter.
 */
class ViewModel {
    /**
     * @constructor
     * @param {*} schema AST nodes indexed by kind
     * @param {*} gqlAST AST schema as produced by {@link graphql.parse}.
     */
    constructor(schema, gqlAST) {
        this.schema = schema;
        this.gqlAST = gqlAST;

        helpers.makeGettersEnumerable(this);
    }

    /**
     * @returns {TypeViewModel[]} array with a single query type.
     */
    get Query() {
        return filter.Query(this.schema).map(type => new TypeViewModel(type, this.gqlAST));
    }

    /**
     * @returns {TypeViewModel[]} array with a single mutation type.
     */
    get Mutation() {
        return filter.Mutation(this.schema).map(type => new TypeViewModel(type, this.gqlAST));
    }

    /**
     * @returns {TypeViewModel[]} array with a all types (except Query and Mutation).
     */
    get Types() {
        return filter.Types(this.schema).map(type => new TypeViewModel(type, this.gqlAST));
    }

    /**
     * @returns {InterfaceViewModel[]} array with a all interfaces
     */
    get Interfaces() {
        return filter.Interfaces(this.schema).map(type => new InterfaceViewModel(type, this.gqlAST));
    }

    /**
     * @returns {EnumViewModel[]} array with a all enums
     */
    get Enums() {
        return filter.Enums(this.schema).map(type => new EnumViewModel(type, this.gqlAST));
    }

    /**
     * @returns {UnionViewModel[]} array with a all union types
     */
    get Unions() {
        return filter.Unions(this.schema).map(type => new UnionViewModel(type, this.gqlAST));
    }

    /**
     * @returns {InputViewModel[]} array with a all input types
     */
    get "Input Types"(){
        return filter["Input Types"](this.schema).map(type => new InputViewModel(type, this.gqlAST));
    }

    /**
     * @returns {ScalarViewModel[]} array with a all scalars
     */
    get Scalars(){
        return filter.Scalars(this.schema).map(type => new ScalarViewModel(type, this.gqlAST));
    }
}

module.exports = ViewModel;
/*module.exports = class {
    constructor(schema, gqlAST) {
        let viewModel = new ViewModel(schema, gqlAST);
        for (let prop in viewModel){
            this[prop] = viewModel[prop];
        }
    }
}*/


/*class {
    // This class handles a bug in EJS that prevents it from working with ES6 class with
    constructor(schema, gqlAST) {
        let viewModel = new ViewModel(schema, gqlAST);
        let props = Object.getOwnPropertyNames(Object.getPrototypeOf(viewModel));
        for (let i in props){
            let prop = props[i];
            this[prop] = viewModel[prop];
        }
    }
}*/