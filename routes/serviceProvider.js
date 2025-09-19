// Importing express to create routes
const express = require('express')

// Importing Admin model (service providers / admins stored in DB)
const Admin = require('../models/ServiceProvider')
// Initializing express router
const router = express.Router()
// Importing bcrypt for hashing passwords
const bcrypt = require('bcryptjs')
// Importing jwt for authentication tokens
const jwt = require('jsonwebtoken')

// Secret key for JWT signing (should be in environment variable in real projects)
const JWT_SECRET = "You are a good boy heheheh"
// Middleware for verifying admin authentication
const fetchadmin = require('../middleware/fetchAdmin')
// Importing Product model (if needed for admin tasks later)
const Product = require('../models/Product');

// Importing express-validator to validate input fields
const { query, matchedData, body, validationResult } = require('express-validator');



// route 1
// Create a new admin account
router.post('/createAdmin', [

    // Validating that name is at least 3 characters
    body('name', "Enter a valid name(length > 3)").isLength({ min: 3 }),
    // Validating that email is in proper format
    body('email', "Enter a valid and unique email").isEmail(),
    // Validating that password is at least 5 characters
    body('password', "Password length should be more than 5").isLength({ min: 5 }),

], async (req, res) => {

    // Checking if validation failed
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Sending all validation errors to the client
        return res.status(400).json({ errors: errors.array() });
    }

    // Checking if an admin with this email already exists
    let admin = await Admin.findOne({ email: req.body.email })
    if (admin) {
        return res.status(400).json({ error: "Sorry a user with this email already exists" })
    }

    // Generating salt for password hashing
    const salt = await bcrypt.genSalt(10)
    // Hashing the password using bcrypt
    const securePassword = await bcrypt.hash(req.body.password, salt)

    // Creating a new admin and saving in DB
    admin = await Admin.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,
    })

    // Creating payload data for JWT
    const data = {
        admin: {
            id: admin.id
        }
    }

    // Signing JWT token with secret key
    var token = jwt.sign(data, JWT_SECRET);

    // Sending token as response
    res.json({ token })

})


// routes 2
// Login an admin (authentication route)
router.post('/login', [

    // Validate that email is correct format
    body('email', "Enter a valid and unique email").isEmail(),
    // Ensure password field is provided
    body('password', "Password cannot be blank").exists(),

], async (req, res) => {

    // Checking if validation failed
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // If errors found, send them to client
        return res.status(400).json({ errors: errors.array() });
    }

    // Extract email and password from request
    const { email, password } = req.body
    try {
        // Finding admin with provided email
        let admin = await Admin.findOne({ email })

        // If no admin found with given email
        if (!admin) {
            return res.status(400).json({ error: "Student not registered" })
        }

        // Comparing provided password with hashed password in DB
        const passwordCompare = await bcrypt.compare(password, admin.password)

        // If password does not match
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please Try logging in with the correct credentials" })
        }

        // Preparing payload for JWT
        const data = {
            admin: {
                id: admin.id
            }
        }

        // Signing and creating JWT token
        let token = jwt.sign(data, JWT_SECRET)
        // Sending token back to client
        res.json({ token })

    } catch (error) {
        // Logging any errors for debugging
        console.log(error);
    }
})

// routes 3 
// Get logged-in admin details (except password)
router.get('/getAdmin', fetchadmin, async (req, res) => {

    try {
        // Getting admin id from middleware (added in req.admin)
        const adminId = req.admin.id

        // Finding admin by id but excluding password field
        const admin = await Admin.findById(adminId).select('-password')
        // Sending admin details as response
        res.send(admin)
    } catch (error) {
        // Logging errors for debugging
        console.log(error);
    }
})


// Exporting router so it can be used in server.js
module.exports = router
