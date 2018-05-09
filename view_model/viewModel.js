const graphql = require('graphql');
const sanitize = require('sanitize-html');
const md = require('markdown-it')({
    html: true,
    linkify: true
});

const helpers = require('./helpers');
const TypeViewModel = require('./typeViewModel').TypeViewModel;
const InterfaceViewModel = require('./typeViewModel').InterfaceViewModel;
const ScalarViewModel = require('./typeViewModel').ScalarViewModel;
const EnumViewModel = require('./typeViewModel').EnumViewModel;
const UnionViewModel = require('./typeViewModel').UnionViewModel;
const InputViewModel = require('./typeViewModel').InputViewModel;

/**
 * View model that represents the GraphQL schema for the EJS generator.
 */
class ViewModel {
    /**
     * @constructor
     * @param {graphql.GraphQLSchema} schema GraphQL schema as produced by {@link graphql.buildSchema}.
     * @param {string} apiName the name of the API
     * @param {string} apiDescription a description of the API. May be HTML or Markdown (HTML will be sanitized).
     */
    constructor(schema, apiName, apiDescription) {
        this.schema = schema;
        this._types = helpers.mapToArray(schema.getTypeMap());
        this.apiName = sanitize(apiName, { allowedTags: [] });
        this.apiDescription = md.renderInline(sanitize(apiDescription));

        helpers.makeGettersEnumerable(this);
    }

    /**
     * @returns {string[]} the order in which the elements should be displayed.
     *      These strings match the name of the getters of this class.
     */
    get Order(){
        return ["Query", "Mutation", "Subscription", "Types", "Interfaces",
                "Enums", "Unions", "Input Types", "Scalars"];
    }

    /**
     * 
     * @param {string} type 
     * @returns {graphql.GraphQLNamedType[]}
     */
    _getObjectsOfType(type) {
        return this._types.filter(item => item.constructor.name === type);
    }

    /**
     * @returns {TypeViewModel[]} array with a single query type.
     */
    get Query() {
        return this.schema.getQueryType()? [new TypeViewModel(this.schema.getQueryType(), this.schema)] : [];
    }

    /**
     * @returns {TypeViewModel[]} array with a single mutation type.
     */
    get Mutation() {
        return this.schema.getMutationType()? [new TypeViewModel(this.schema.getMutationType(), this.schema)] : [];
    }

    /**
     * @returns {TypeViewModel[]} array with a single subscription type.
     */
    get Subscription() {
        return this.schema.getSubscriptionType()? [new TypeViewModel(this.schema.getMutationType(), this.schema)] : [];
    }

    /**
     * @returns {TypeViewModel[]} array with a all types (except Query and Mutation).
     */
    get Types() {
        let excludedTypes = this.Query.concat(this.Mutation, this.Subscription);
        return this._getObjectsOfType("GraphQLObjectType")
            .filter(item=> !excludedTypes.some(exl => exl.name === item.name))
            .map(type => new TypeViewModel(type, this.schema));
    }

    /**
     * @returns {InterfaceViewModel[]} array with a all interfaces
     */
    get Interfaces() {
        return this._getObjectsOfType("GraphQLInterfaceType").map(type => new InterfaceViewModel(type, this.schema));
    }

    /**
     * @returns {EnumViewModel[]} array with a all enums
     */
    get Enums() {
        return this._getObjectsOfType("GraphQLEnumType").map(type => new EnumViewModel(type, this.schema));
    }

    /**
     * @returns {UnionViewModel[]} array with a all union types
     */
    get Unions() {
        return this._getObjectsOfType("GraphQLUnionType").map(type => new UnionViewModel(type, this.schema));
    }

    /**
     * @returns {InputViewModel[]} array with a all input types
     */
    get "Input Types"(){
        return this._getObjectsOfType("GraphQLInputObjectType").map(type => new InputViewModel(type, this.schema));
    }

    /**
     * @returns {ScalarViewModel[]} array with a all scalars
     */
    get Scalars(){
        return this._getObjectsOfType("GraphQLScalarType").map(type => new ScalarViewModel(type, this.schema));
    }
}

module.exports = ViewModel;