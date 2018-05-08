const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const graphql = require('graphql');

const ViewModel = require('./view_model/viewModel');
const scriptDir = __dirname;

module.exports = {
    /**
     * Builds an API page for
     * 
     * @param {graphql.GraphQLSchema} schema the schema as built by graphql.buildSchema (or buildClientSchema).
     * @param {string} apiName the name of the API. Will be displayed in page title and header.
     * @param {string} apiDescription a description of the API. Will be displayed in page header.
     * @param {string} outputFile path of file to which the HTML file will be written.
     */
    buildAPIPage: function (schema, apiName, apiDescription, outputFile){
    
        let templateParam = {
            viewModel: new ViewModel(schema),
            apiName: apiName,
            apiDescription: apiDescription,
        }
    
        ejs.renderFile(path.join(scriptDir,'templates/main.ejs'), templateParam,null,function(err,str){
            if (err){
                console.error("Could not render: " + err);
                return;
            }
            fs.writeFileSync(outputFile, str);
        });
    }
    
}