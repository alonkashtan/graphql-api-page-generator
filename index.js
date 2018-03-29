#!/usr/bin/env node

const ejs = require('ejs');
const fs = require('fs')
const graphql = require('graphql');
const parsers = require('./parsers')
const elementsTypeFilter = require('./elementsTypeFilter.js')

// schema. TODO: get file
let schemaText =`
    "Represents a year"
    scalar Year
    
    "A named object"
    interface Named {
        "name of the object"
        name: String
    }
    
    "Represents a student"
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

let AST = graphql.parse(schemaText);
fs.writeFileSync('out.json', JSON.stringify(AST,null,4));

let schema = {
    index: {}
}

// prepare by type
AST.definitions.forEach(function(item){
    if (!schema[item.kind]) schema[item.kind]=[];

    schema[item.kind].push(item);
    schema.index[item.name.value] = item.kind
})

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
