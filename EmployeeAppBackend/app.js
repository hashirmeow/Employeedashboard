// Task1: initiate app and run server at 3000

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

const path=require('path');
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
// Task2: create mongoDB connection 


//Task 2 : write api with error handling and appropriate api mentioned in the TODO below







//TODO: get data from db  using api '/api/employeelist'




//TODO: get single data from db  using api '/api/employeelist/:id'





//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}






//TODO: delete a employee data from db by using api '/api/employeelist/:id'





//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 }
});
const Employee = mongoose.model('Employee', employeeSchema);

function validEmployeeId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        console.error('Could not retrieve employees:', error.message);
        res.status(500).json({ message: 'Could not retrieve employees' });
    }
});

app.get('/api/employeelist/:id', async (req, res) => {
    if (!validEmployeeId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid employee id' });
    }
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        console.error('Could not retrieve employee:', error.message);
        res.status(500).json({ message: 'Could not retrieve employee' });
    }
});

app.post('/api/employeelist', async (req, res) => {
    try {
        const employee = await Employee.create({
            name: req.body.name,
            location: req.body.location,
            position: req.body.position,
            salary: req.body.salary
        });
        res.status(201).json(employee);
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        console.error('Could not add employee:', error.message);
        res.status(500).json({ message: 'Could not add employee' });
    }
});

app.put('/api/employeelist', async (req, res) => {
    const { _id, name, location, position, salary } = req.body;
    if (!validEmployeeId(_id)) {
        return res.status(400).json({ message: 'A valid employee _id is required' });
    }
    try {
        const employee = await Employee.findByIdAndUpdate(
            _id,
            { name, location, position, salary },
            { new: true, runValidators: true }
        );
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        console.error('Could not update employee:', error.message);
        res.status(500).json({ message: 'Could not update employee' });
    }
});

app.delete('/api/employeelist/:id', async (req, res) => {
    if (!validEmployeeId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid employee id' });
    }
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee deleted', employee });
    } catch (error) {
        console.error('Could not delete employee:', error.message);
        res.status(500).json({ message: 'Could not delete employee' });
    }
});

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('Set the MONGODB_URI environment variable to your MongoDB Atlas connection string.');
    process.exit(1);
}

mongoose.connect(mongoUri, process.env.MONGODB_DB ? { dbName: process.env.MONGODB_DB } : {})
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(3000, () => console.log('Employee app listening on port 3000'));
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    });


