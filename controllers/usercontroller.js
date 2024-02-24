const axios = require('axios');
const conn = require('../utils/dbconn');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for hashing
const { validationResult } = require('express-validator');

exports.renderHome = (req, res) => {
    // Check if the user is authenticated
    const isAuthenticated = req.session.isloggedin || false;

    // Render the home page view with the isAuthenticated property
    res.render('home', { isAuthenticated: isAuthenticated });
};

exports.renderSignupForm = (req, res) => {
    const endpoint = `http://localhost:3002/signup`;
    const isAuthenticated = req.session.isloggedin || false;

    res.render('signup', { isAuthenticated: isAuthenticated });

    // axios
    //     .get(endpoint)
    //     .then((response) => {
    //         const data = response.data.result;
    //         res.render('signup', { result: data });
    //     })
    //     .catch((error) => {
    //         console.log(`Error making API request: ${error}`);
    //     });
};

exports.signupPost = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    // If all validation passes, proceed with user creation

    // Extract form data from request body
    const { username, firstName, lastName, email, password } = req.body;

    // Hash the plaintext password
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Check if the username already exists in the database
        const checkUserSQL = `SELECT * FROM user WHERE username = ?`;
        conn.query(checkUserSQL, [username], (err, rows) => {
            if (err) {
                console.error('Error checking user:', err);
                return res.status(500).send('Internal Server Error');
            }

            // If the username already exists, return an error
            if (rows.length > 0) {
                return res.status(400).send('Username already exists');
            }

            // Insert the new user into the database with the hashed password
            const insertUserSQL = `INSERT INTO user (username, first_name, last_name, email_address, password) VALUES (?, ?, ?, ?, ?)`;
            const values = [username, firstName, lastName, email, hashedPassword];
            conn.query(insertUserSQL, values, (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).send('Internal Server Error');
                }
                
                // User created successfully
                console.log('User created:', result);
                // Redirect to login page after successful signup
                res.render('signin', { 
                    isAuthenticated: req.session.isloggedin, 
                    success: 'You have successfully signed up, sign in here' 
                });
            });
        });
    });
};


exports.renderSigninForm = (req, res) => {
    const endpoint = `http://localhost:3002/signin`;
    const isAuthenticated = req.session.isloggedin || false;
    res.render('signin', { isAuthenticated: isAuthenticated });

    // axios
    //     .get(endpoint)
    //     .then((response) => {
    //         const data = response.data.result;
    //         res.render('signup', { result: data });
    //     })
    //     .catch((error) => {
    //         console.log(`Error making API request: ${error}`);
    //     });
};

exports.signinPost = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    // If all validation passes, proceed with sign in

    const { username, password } = req.body;

    // Query database to find user with provided username
    const checkUserSQL = `SELECT * FROM user WHERE username = ?`;
    conn.query(checkUserSQL, [username], (err, rows) => {
        if (err) {
            console.error('Error querying user:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Check if user with provided username exists
        if (rows.length === 0) {
            return res.status(401).send('Invalid username or password');
        }

        // Compare provided password with hashed password stored in database
        bcrypt.compare(password, rows[0].password, (err, passwordMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).send('Internal Server Error');
            }

            // If passwords match, login successful
            if (passwordMatch) {
                // Create session or set a cookie to indicate user is logged in
                const session = req.session;
                session.isloggedin = true;
                session.userid = rows[0].user_id;
                console.log('User logged in:', session);
                res.redirect('/');
            } else {
                res.status(401).send('Invalid username or password');
            }
        });
    });
};

exports.getSignout = (req, res) => {
    // Destroy the session (or clear session data as needed)
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        // Redirect the user to the home page after logout
        res.redirect('/');
    });
};


// // Using thecatapi:
// exports.getRandomCat = (req, res) => {

//     const thecatapi = `https://api.thecatapi.com/v1/images/search?limit=15`;

//     const config = { 
//         validateStatus: (status) => { return status < 500 },
//         headers: { 'x-api-key': `${process.env.CATAPIKEY}` }
//     };
    
//     axios
//         .get(thecatapi, config)
//         .then((response) => {
//             console.log(response.data);
//             console.log(response.data.length);
//             res.render('randomcat', { catpic: response.data }); 

//         })
//         .catch((error) => {
//             if (error.response) {
//                 console.log('Error Response!');
//                 console.log(error.response.data);
//             } else if (error.request) {
//                 console.log(error);
//             }
//         });

// }