#!/usr/bin/env node

const ejs = require('ejs');
const fs = require('fs')
const graphql = require('graphql');
const parsers = require('./parsers')
const elementsTypeFilter = require('./elementsTypeFilter.js')
const sanitizer = require('./schemaSanitizer')
const preprocessor = require('./schemaPreprocessor');

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
        name: String
    }
    
    "Represents a student. This is a very important object for understanding how this repo works af therefore needs a very very long description so we know it's important"
    type Student implements Named {
        "The name of the student"
        name: String
        "Current age"
        age: Year 
        "The average grade"
        grade: Float    
    }

    "Course difficulty"
    enum Difficulty{
        "Easy"
        EASY, 
        "Hard"
        HARD
    }
    
    "A course"
    type Course implements Named {
        "The name of the course"
        name: String
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
        students(first: Int): [Student]
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
        addStudent("Student name" name: String, x: [inputStudent]): Int
    }
`;

// TODO: get from arguments
let apiName = 'Example API'
let apiDescription = 'This is the best API in the neighborhood.'
let outputFile = 'out.html';

let AST = JSON.stringify(graphql.parse(schemaText),null,4);
fs.writeFileSync('out.json', AST);

let schema = {
    index: {}
}
AST = JSON.parse(AST); //The double parse eliminates some strange tags that have loops in the references when the AST was built

sanitizer(AST);

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
    schema: schema,
    name: apiName,
    description: apiDescription,
    filter: elementsTypeFilter
}

ejs.renderFile('./templates/main.ejs', templateParam,null,function(err,str){
    if (err){
        console.error("Could not render: " + err);
        return;
    }
    fs.writeFileSync(outputFile, str);
});

process.exit()
