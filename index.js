#!/usr/bin/env node

const ejs = require('ejs');
const fs = require('fs')
const graphql = require('graphql');
const elementsTypeFilter = require('./elementsTypeFilter.js')
const sanitizer = require('./schemaSanitizer')
const preprocessor = require('./schemaPreprocessor');
const ViewModel = require('./view_model/viewModel');

// schema. TODO: get file
let schemaText =`
    """
    Represents a <b>year</b><br/>
    And more
    """
    scalar Year
    
    "A named object <img src='hello'/> <h1>definition</h1>"
    interface Named {
        "name of the object"
        name(num: Int! @deprecated(reason: "use family instead")): String!
    }
    
    "Represents a student. This is a very important object for understanding how this repo works af therefore needs a very very long description so we know it's important"
    type Student implements Named  @deprecated (reason: "yup") {
        "The name of the student"
        name(num: Int!): String! @deprecated(reason: "Bad idea") @range(min: 7)
        "Current age"
        age: Year 
        "The average grade"
        grade: Float
    }

    "Course difficulty"
    enum Difficulty{
        "Easier then eating pizza"
        EASY, 
        "Harder then eating just one slice of pizza"
        HARD
    }
    
    "A course"
    type Course implements Named {
        "The name of the course"
        name(num: Int!): String!
        "All the students that study the course"
        students(
            "Show only students above this grade"
            minimumGrade: Int): [Student]

        difficulty: Difficulty
    }
    
    "desc desc"
    union UniversityObject = Student | Course
    
    "desc desc"
    type Query{
        "get all students"
        students(first: Int @range(max: 500),
            "Starts with this letter"
            letter: String! @length(min:1, max: 1)
        ): [Student]
        "get all courses"
        courses: [Course]
        "desc desc"
        namedObjects: [Named]
        "desc desc"
        universityThingies: [UniversityObject]
    }
    
    "Student input info"
    input InputStudent{
        "Student name"
        name: String
    }

    "desc desc"
    type Mutation{
        "Add a student. Returns ID of the student"
        addStudent("Student name" name: String, x: [InputStudent]): Int
    }
`;

// TODO: get from arguments
let apiName = 'Example API';
let apiDescription = 'This is the best API in the neighborhood.';
let outputFile = 'out.html';

let gqlSchema = graphql.parse(schemaText);
let AST = JSON.stringify(gqlSchema,null,4);
fs.writeFileSync('out.json', AST);

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

process.exit()
