const graphql = require('graphql');
const sanitize = require('sanitize-html');
const md = require('markdown-it')({
    html: true,
    linkify: true
});

const helpers = require('./helpers');

/**
 * Returns names of type and basic type for a node.
 * The basic type is used for links.
 * For example, for [string!] will be returned:
 * {
 *  type: "[string!]",
 *  basicType: "string"
 * }
 * @param {*} type the node of this type in the schema
 */
function getBasicType(type){
    
    if (type.ofType) {
        return getBasicType(type.ofType); // the basic type may also be composite, e.g. for "[String!]!"
    }
    return type.toString();
}

/**
 * A view model for a template for a type schema
 */
class AbstractTypeViewModel {
    /**
     * @constructor
     * @param {graphql.GraphQLSchema} completeSchema GraphQL schema as produced by {@link graphql.buildSchema}.
     * @param {graphql.GraphQLNamedType} itemSchema the part of {@link #completeSchema} that represents the current item
     */
    constructor(itemSchema, completeSchema){
        this.itemSchema = itemSchema
        this.completeSchema = completeSchema;

        helpers.makeGettersEnumerable(this);
    }

    /**
     * Kind of node represented by this view model
     */
    // currently used only for default Deprecated message.
    get kind(){
        return 'Object';
    }

    get name(){
        return this.itemSchema.name;
    }

    get description(){
        return this.itemSchema.description
            ? md.renderInline(sanitize(this.itemSchema.description))
            : null;
    }

    get descriptionText(){
        return this.itemSchema.description
            ? sanitize(md.render(this.itemSchema.description), { allowedTags: [] })
            : null;
    }

    /**
     * @returns {(string|boolean)} a string describing the reason that this node is deprecated or false if not deprecated.
     */
    get deprecated(){
        return helpers.deprecated(this.itemSchema, this.kind)
    }
}

class ScalarViewModel extends AbstractTypeViewModel {
    get kind(){
        return 'Scalar';
    }
}

class TypeViewModel extends AbstractTypeViewModel {
    get kind(){
        return 'Type';
    }

    get fields(){
        return helpers.mapToArray(this.itemSchema.getFields())
                    .map(field => new FieldViewModel(field, this.completeSchema));
    }

    get implements(){
        if (!this.itemSchema.getInterfaces) return undefined;
        
        return this.itemSchema.getInterfaces()
            .map(inter => inter.name)
    }
}

class InterfaceViewModel extends TypeViewModel {
    get kind(){
        return 'Interface';
    }

    get implementors(){
        return this.completeSchema.getPossibleTypes(this.itemSchema)
            .map(type => type.name);
    }
}

class InputViewModel extends TypeViewModel {
    get kind(){
        return 'Input Type';
    }

    get fields(){
        return helpers.mapToArray(this.itemSchema.getFields())
                    .map(field => new InputFieldViewModel(field, this.completeSchema)); 
    }
}

class AbstractFieldViewModel extends AbstractTypeViewModel{
    get type(){
        return this.itemSchema.type.toString();
    }
    
    get basicType(){
        return getBasicType(this.itemSchema.type);
    }

    get range(){
        return helpers.getDirective(this.itemSchema, 'range');
    }

    get mask(){
        return helpers.getDirective(this.itemSchema, 'mask');
    }

    get length(){
        return helpers.getDirectives(this.itemSchema, 'length');
    }
}

class FieldViewModel extends AbstractFieldViewModel {
    get kind(){
        return 'Field'
    }

    get arguments(){
        return this.itemSchema.args.map(arg => new ArgumentViewModel(arg, this.completeSchema));
    }
}

class InputFieldViewModel extends FieldViewModel {
    get arguments(){
        return [];
    }
}

class ArgumentViewModel extends AbstractFieldViewModel{
    get kind(){
        return 'Argument';
    }
}

class EnumViewModel extends AbstractTypeViewModel {
    get kind() {
        return 'Enum';
    }

    get values(){
        return this.itemSchema.getValues().map(value => new EnumValueViewModel(value, this.completeSchema));
    }
}

class EnumValueViewModel extends AbstractTypeViewModel {
    get kind(){
        return 'Enum Value'
    }
}

class UnionViewModel extends AbstractTypeViewModel{
    get kind(){
        return 'Union Type'
    }

    get types() {
        return this.completeSchema.getPossibleTypes(this.itemSchema)
            .map(type => ({
                type: type.name,
                basicType: getBasicType(type)
            }));
    }
}


module.exports = {
    TypeViewModel: TypeViewModel,
    InterfaceViewModel: InterfaceViewModel,
    ScalarViewModel: ScalarViewModel,
    EnumViewModel: EnumViewModel,
    UnionViewModel: UnionViewModel,
    InputViewModel: InputViewModel
}