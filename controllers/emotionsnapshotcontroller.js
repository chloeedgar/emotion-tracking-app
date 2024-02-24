const axios = require('axios');
const conn = require('../utils/dbconn');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for hashing

