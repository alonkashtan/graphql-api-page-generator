const ejs = require('ejs');
const fs = require('fs');
const graphql = require('graphql');

const elementsTypeFilter = require('./elementsTypeFilter.js')
const sanitizer = require('./schemaSanitizer')
const preprocessor = require('./schemaPreprocessor');
const ViewModel = require('./view_model/viewModel');

module.exports = {
    /**
     * Builds an API page for
     * 
     * @param {GraphQLSchema} gqlSchema the schema as built by graphql.js (for example with graphql.parse).
     * @param {string} apiName the name of the API. Will be displayed in page title and header.
     * @param {string} apiDescription a description of the API. Will be displayed in page header.
     * @param {string} outputFile path of file to which the HTML file will be written.
     */
    buildAPIPage: function (gqlSchema, apiName, apiDescription, outputFile){
        let AST = JSON.stringify(gqlSchema,null,4);
    
        let schema = {
            index: {}
        }
        AST = JSON.parse(AST); //The double parse eliminates some strange tags that have loops in the references when the AST was built
    
        sanitizer(AST);
        fs.writeFileSync('out.json', JSON.stringify(AST,null, 4));
    
        // prepare by type
        AST.definitions.forEach(function(item){
            if (!schema[item.kind]) schema[item.kind]=[];
    
            schema[item.kind].push(item);
            if (item.name)
                schema.index[item.name.value] = item.kind;
        });
    
        // Add implementors to interface definitions
        preprocessor.addImplementors(
            // for all types, including Query and Mutation (although not very likely they will implement an interface)
            elementsTypeFilter.Types(schema).concat(elementsTypeFilter.Query(schema), elementsTypeFilter.Mutation(schema)), 
            elementsTypeFilter.Interfaces(schema));
    
        let templateParam = {
            viewModel: new ViewModel(schema, graphql.buildASTSchema(gqlSchema)),
            apiName: apiName,
            apiDescription: apiDescription,
            order: elementsTypeFilter
        }
    
        ejs.renderFile('./templates/main.ejs', templateParam,null,function(err,str){
            if (err){
                console.error("Could not render: " + err);
                return;
            }
            fs.writeFileSync(outputFile, str);
        });
    
        process.exit();
    }
    
}