const express = require('express');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv').config({ path: './config.env' });
const userrouter = require('./routes/userroutes');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

// Set view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '/public')));

// Log requests with Morgan
app.use(morgan('tiny'));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Add session middleware before defining routes
app.use(session({
    secret: 'mysecretstring1234', 
    resave: false,  
    saveUninitialized: false 
}));


// Use userrouter for handling user routes
app.use('/', userrouter);


// Start the server
app.listen(process.env.PORT, (err) => {
    if (err) return console.log(err);

    console.log(`Express listening on port ${process.env.PORT}`);
});