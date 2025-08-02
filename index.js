const express = require('express');
const mongoose = require('mongoose'); // Ensure mongoose is imported
const port = 4000;
const path = require('path');

// Require the mongoose file (ensure this matches your db connection setup)
const db = require('./config/mongoose'); 
const User = require('./models/register');
const Login = require('./models/login');
const Dashboard = require('./models/dashboard');

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Fix deprecated warning
app.use(express.static('assets'));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== ROUTES ===== //


// Health check endpoint (required for Docker healthcheck)
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const status = dbStatus === 'connected' ? 'OK' : 'Unhealthy';
    
    if (status === 'OK') {
        res.status(200).json({ status, dbStatus, timestamp: new Date().toISOString() });
    } else {
        res.status(503).json({ status, dbStatus, timestamp: new Date().toISOString() });
    }
});


// Existing routes
app.use("/", require("./routes/index"));


// User registration
app.post('/register', (req, res) => {
    User.create({
        name: req.body.name,
        lastName: req.body.lastName,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password
    })
    .then(user => {
        console.log("User  created:", user);
        res.redirect('/dashboard');
    })
    .catch(err => {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Registration failed" });
    });
});

// Task management
app.post('/addtask', (req, res) => {
    Dashboard.create({
        task: req.body.task,
        date: req.body.date,
        description: req.body.description,
        time: req.body.time,
        categoryChoosed: req.body.categoryChoosed
    })
    .then(newTask => {
        console.log("Task created:", newTask);
        res.redirect('back');
    })
    .catch(err => {
        console.error("Task creation error:", err);
        res.redirect('back');
    });
});

app.get('/complete-task', (req, res) => {
    Dashboard.findByIdAndUpdate(req.query.id, { completed: true })
    .then(task => {
        console.log("Task completed:", task);
        res.redirect('back');
    })
    .catch(err => {
        console.error("Completion error:", err);
        res.redirect('back');
    });
});

app.get('/delete-task', (req, res) => {
    Dashboard.findByIdAndDelete(req.query.id)
    .then(() => {
        console.log("Task deleted");
        res.redirect('back');
    })
    .catch(err => {
        console.error("Deletion error:", err);
        res.redirect('back');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});



