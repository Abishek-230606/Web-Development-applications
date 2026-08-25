import express from "express";
import fs from "fs";
import {studentsdb} from "./studentdb.js";
import { applySorting } from "./sortUtils.js";

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.text());
 
app.get("/student", (req, res) => {
    try {
        // Tries to execute and load the file 

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        //  maximum limit  20
        if (limit > 20) {
            limit = 20;
        }

        const searchQuery = req.query.search;

        // Filter by search query if provided
        let filteredStudents = studentsdb;
        
        if (searchQuery) {
            filteredStudents = studentsdb.filter(student => 
                student.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply sorting from imported function
        filteredStudents = applySorting(filteredStudents, req.query.sort);
        

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
        
        res.status(200).json({
            page: page,
            //totalStudentsOverall: studentsdb.length,
            totalStudents: filteredStudents.length,
            //studentsListedInThisRequest: paginatedStudents.length,
            data: paginatedStudents
        });
        
    } catch (error) {
        console.error("Failed to load JS file:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/student", (req,res) => {
    const newStudent = req.body.name;
    const newCgpa = req.body.cgpa;
    const newDept = req.body.dept;
    const newAge = req.body.age;

    try {
        const newId = studentsdb.length > 0 ? studentsdb[studentsdb.length - 1].id + 1 : 1;
        
        studentsdb.push({ 
            id: newId, 
            name: newStudent, 
            cgpa: newCgpa, 
            dept: newDept,
            age: newAge
        });
        
        res.status(201).json({ 
            message: "Student added successfully!", 
            students: studentsdb[newId-1]
        });
    
        
    } catch (error) {
        console.error("Failed to load JS file:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.patch("/student", (req,res)=>{
    const studentid = Number(req.query.id);
    let foundstudent = null; // Store the actual student here!
    if(studentid === 0 || isNaN(studentid)){
        return res.status(400).json({ message: "Invalid student ID" });
    }
    try {
        for(let i=0;i<studentsdb.length;i++){
            if(studentsdb[i].id === studentid){
                // Update only the fields that were sent in the request
                if (req.body.name) studentsdb[i].name = req.body.name;
                if (req.body.cgpa) studentsdb[i].cgpa = req.body.cgpa;
                if (req.body.dept) studentsdb[i].dept = req.body.dept;
                if (req.body.age) studentsdb[i].age = req.body.age;
                
                foundstudent = studentsdb[i]; // Save the updated student
                break;
            }
        }
        
        if (foundstudent) {
            res.status(200).json({ 
                message: `Student updated!`, 
                student: foundstudent
            });
        } else {
            res.status(404).json({ message: "Student not found" });
        }

    }  catch (error) {
        console.error("Failed to update student:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
app.delete("/student", (req,res)=>{
    const studentid = Number(req.query.id);
    let studentIndex = -1;
    let deletedStudent = null;
    if(studentid === 0 || isNaN(studentid)){
        return res.status(400).json({ message: "Invalid student ID" });
    }
    try {
        // Find the index of the student using a for loop
        for (let i = 0; i < studentsdb.length; i++) {
            if (studentsdb[i].id === studentid) {
                studentIndex = i;
                deletedStudent = studentsdb[i];
                break;
            }
        }

        // If studentIndex is not -1, it means we found the student!
        if (studentIndex !== -1) {
            studentsdb.splice(studentIndex, 1);
            
            res.status(200).json({
                message: "Student deleted successfully!", 
                //deletedStudent: deletedStudent 
            });   
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (error) {
        console.error("Failed to delete student:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

