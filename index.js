#!/usr/bin/env node

process.argv[1] = "gqlapi" // cause yargs to take the name of the bin rather than the name 'index.js'

const fs = require('fs')
const graphql = require('graphql');
const yargs = require('yargs');
const request = require('request');

const apiPageBuilder = require('./apiPageBuilder');

let args = yargs
    .usage('Usage: $0 <from-file|from-url> <options>')
    .strict()
    .command('from-file <outputfile> <path> <apiname> [description]', 'Writes API as HTML from a file to the given output file', 
        (yargs) =>{
            yargs.positional('outputfile', {
                describe: 'name (and path) of file to which the API HTML will be saved',
                default: 'API.html'
            })
            .positional('path', {
                describe: "the path to the graphql schema file (in graphql.js SDL format)",
                type: 'string',
                normalize: true
            })
            .positional('apiname', {
                describe: "name of the API",
                type: 'string'
            })
            .positional('description', {
                describe: "description of the API",
                type: 'string'
            })
        },
        (args) => {
            let schemaText = fs.readFileSync(args.path, 'utf-8');
            apiPageBuilder.buildAPIPage(graphql.parse(schemaText), args.apiname, args.description, args.outputfile);
        }
    )
    .command('from-url <outputfile> <url> <apiname> [description]', 'Writes API as HTML from a live GraphQL server (via introspection) to the given output file', 
        (yargs) =>{
            yargs.positional('outputfile', {
                describe: 'name (and path) of file to which the API HTML will be saved',
                default: 'API.html'
            })
            .positional('url', {
                describe: "the path to the graphql file or the URL to the GraphQL service",
                type: 'string'
            })
            .positional('apiname', {
                describe: "name of the API",
                type: 'string'
            })
            .positional('description', {
                describe: "description of the API",
                type: 'string'
            })
        },
        (args) => {
            let query = graphql.introspectionQuery;

            // if protocol is not specified, use http
            if (!args.url.includes("://"))
                args.url="http://"+args.url;

            request(args.url, {
                    body: {
                        query: query
                    },
                    json: true,
                    method: 'POST'
                }, 
                (err, res, body)=>{
                    if (err) {
                        console.error("Could not retrieve introspection query: " + err);
                        process.exit(2);
                    }

                    let schema=graphql.buildClientSchema(body.data);
                    schema = graphql.printSchema(schema);
                    fs.writeFileSync('../self.json', JSON.stringify(body,null,4), 'utf-8')
                    fs.writeFileSync('../self.graphql', schema, 'utf-8')
                    apiPageBuilder.buildAPIPage(graphql.parse(schema), args.apiname, args.description, args.outputfile);
            })
        }
    )
    .demandCommand()
    .help()
    .argv;

