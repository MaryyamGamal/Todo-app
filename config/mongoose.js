require('dotenv').config();

// Require mongoose
const mongoose = require('mongoose');

// Connect to the database using the correct environment variable
mongoose.connect(process.env.mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Database connection error:', err));

// Acquire the connection (to check if it is successful)
const db = mongoose.connection;

// Check for error
db.on('error', console.error.bind(console, 'Connection error:'));

// Once connection is open, log to console
db.once('open', function() {
    console.log('Database connection is open');
});


