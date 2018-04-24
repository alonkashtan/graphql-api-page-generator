#!/usr/bin/env node
const fs = require('fs')
const graphql = require('graphql');
const yargs = require('yargs');
const reqprom = require('request-promise');

const apiPageBuilder = require('./apiPageBuilder');


let args = yargs
    .usage('$0 <outputfile>', 'writes API as HTML from the uri to the given output file', (yargs) =>{
        yargs.positional('outputfile', {
            describe: 'name (and path) of file to which the API HTML will be saved',
            default: 'API.html'
        })
    })
    .options({
        'type': {
            choices: ["introspection", "file"],
            alias: 't',
            demandOption: true,
            describe: "choose 'file' for local file or 'introspection' for introspecting a server",
        },
        'uri' : {
            describe: "the path to the graphql file or the URL to the GraphQL service",
            alias: 'u',
            demandOption: true,
            type: 'string'
        },
        'name' : {
            describe: "name of the API",
            alias: 'n',
            demandOption: true,
            type: 'string'
        },
        'description': {
            describe: "description of the API",
            alias: 'd',
            demandOption: false,
            type: 'string'
        }
    }
).argv;

let apiName = args.name;
let apiDescription = args.description;
let outputFile = args.outputfile;

// schema
if (args.type === "file"){
    let schemaText = fs.readFileSync(args.uri, 'utf-8');
    apiPageBuilder.buildAPIPage(graphql.parse(schemaText), apiName, apiDescription, outputFile);
}
else if (args.type === "introspection"){
    let query = graphql.introspectionQuery;
    
    let options = {
        method: 'POST',
        uri: args.uri,
        body: {
            query: query
        },
        json: true
    };

    // if protocol is not specified, use http
    if (!options.uri.includes("://"))
        options.uri="http://"+options.uri;

    reqprom(options)
        .then(function(body){
            let schema=graphql.buildClientSchema(body.data);
            schema = graphql.printSchema(schema);
            apiPageBuilder.buildAPIPage(graphql.parse(schema), apiName, apiDescription, outputFile);
        })
        .catch(function(err){
            console.error("Could not retrieve introspection query: " + err);
            process.exit(2);
        })
}

