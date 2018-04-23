const graphql = require('graphql');
const helpers = require('./helpers');

/**
 * Returns names of type and basic type for a node.
 * For example, for [string!] will be returned:
 * {
 *  type: "[string!]",
 *  basicType: "string"
 * }
 * @param {DocumentNode} node the node of this type in the AST
 * @param {GraphQLSchema} gqlAST 
 */
function getType(node, gqlAST){
    let type = graphql.typeFromAST(gqlAST, node);
    return {
        type: type.toString(),
        basicType: type.ofType? type.ofType.toString() : type.toString()
    }
}

/**
 * A view model for a template for a type schema
 */
class AbstractTypeViewModel {
    /**
     * 
     * @param {DocumentNode} typeAST the AST for this type definition
     */
    constructor(typeAST, gqlAST){
        this.ast = typeAST
        this.gqlAST = gqlAST;

        helpers.makeGettersEnumerable(this);
    }

    get kind(){
        return 'Object';
    }

    get name(){
        return this.ast.name.value;
    }

    get description(){
        return graphql.getDescription(this.ast);
    }

    get descriptionText(){
        return this.ast.description? this.ast.description.text || "" : "";
    }

    get deprecated(){
        return helpers.deprecated(this.ast, this.kind)
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
        return this.ast.fields.map(field => new FieldViewModel(field, this.gqlAST));
    }
}

class InterfaceViewModel extends TypeViewModel {
    get kind(){
        return 'Interface';
    }

    get implementors(){
        return this.ast.implementors;
    }
}

class InputViewModel extends TypeViewModel {
    get kind(){
        return 'Input Type';
    }

    get fields(){
        return this.ast.fields.map(field => new InputFieldViewModel(field, this.gqlAST)); 
    }
}

class AbstractFieldViewModel extends AbstractTypeViewModel{
    get type(){
        return getType(this.ast.type, this.gqlAST).type
    }
    
    get basicType(){
        return getType(this.ast.type, this.gqlAST).basicType 
    }

    get range(){
        return helpers.getDirective(this.ast, 'range');
    }

    get length(){
        return helpers.getDirectives(this.ast, 'length');
    }
}

class FieldViewModel extends AbstractFieldViewModel {
    get kind(){
        return 'Field'
    }

    get arguments(){
        return this.ast.arguments.map(arg => new ArgumentViewModel(arg, this.gqlAST));
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
        return this.ast.values.map(value => new EnumValueViewModel(value, this.gqlAST));
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
        return this.ast.types.map(type =>  ({
            type: getType(type, this.gqlAST).type,
            basicType: getType(type, this.gqlAST).type
        }))
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