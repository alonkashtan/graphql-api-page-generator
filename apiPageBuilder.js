const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const graphql = require('graphql');

const ViewModel = require('./view_model/viewModel');
const scriptDir = __dirname;

module.exports = {
    /**
     * Builds an API page for a given schema
     * 
     * @param {graphql.GraphQLSchema} schema the schema as built by graphql.buildSchema (or buildClientSchema).
     * @param {string} apiName the name of the API. Will be displayed in page title and header.
     * @param {string} apiDescription a description of the API. Will be displayed in page header. 
     *                      May be HTML or Markdown (HTML will be sanitized).
     * @returns {Promise.<string>} a promise that represents the rendered HTML as a string.
     */
    buildAPIPage: function (schema, apiName, apiDescription){
    
        let templateParam = {
            viewModel: new ViewModel(schema, apiName, apiDescription),
        }
    
        let promise = new Promise((resolve, reject) => {
            ejs.renderFile(path.join(scriptDir,'templates/main.ejs'), templateParam,null,function(err,str){
                if (err){
                    reject("Could not render: " + err);
                    return;
                }
                resolve(str);
            });
        })
        return promise;
    }
    
}