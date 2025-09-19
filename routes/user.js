const express = require('express')

const User = require('../models/User')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchstudent = require('../middleware/fetchstudent')
const JWT_SECRET = "You are a good boy"
const Product=require('../models/Product')


// express-validator imports for validating inputs
const { query, matchedData, body, validationResult } = require('express-validator');





//route 1
//create user

    // Validation rules for incoming request body
router.post('/createuser', [

    body('name', "Enter a valid name(length > 3)").isLength({ min: 3 }),
    body('email', "Enter a valid and unique email").isEmail(),
    body('password', "Password length should be more than 5").isLength({ min: 5 }),

], async (req, res) => {

    // Check for validation errors
    const errors = validationResult(req);

    // If errors exist, return them
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check if user already exists with same email
    let user = await User.findOne({ email: req.body.email })
    if (user) {
        return res.status(400).json({ error: "Sorry a user with this email already exists" })
    }
    // Generate salt for hashing
    const salt = await bcrypt.genSalt(10)
     // Hash the password
    const securePassword = await bcrypt.hash(req.body.password, salt)


    // Create new user in database
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,  // Store hashed password
      
    })
    const data = {
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    }

    // Sign the JWT with secret key
    var token = jwt.sign(data, JWT_SECRET);
      // Return token to client
    res.json({ token })

})

//router 2
//authenticate the user (login)

router.post('/login', [
 // Validation for login input
    body('email', "Enter a valid and unique email").isEmail(),
    body('password', "Password cannot be blank").exists(),

], async (req, res) => {

    const errors = validationResult(req);

 // Validate request body
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Extract email and password from request
    const { email, password } = req.body
    try {
        // Find user with given emai
        let user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ error: "Student not registered" })

        }
        const passwordCompare = await bcrypt.compare(password, user.password)

        if (!passwordCompare) {
            return res.status(400).json({ error: "Please Try logging in with the correct credentials" })

        }
        const data = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }

        let token = jwt.sign(data, JWT_SECRET)
        res.json({ token })

    } catch (error) {
        console.log(error);
    }
}
)

//router 3
//Get user data

router.get('/getUser', fetchstudent, async (req, res) => {

    try {

        const userId = req.user.id

        const user = await User.findById(userId).select('-password')

        res.send(user)
    } catch (error) {
        console.log(error);
    }
})
// Get all users (for admin/testing purpose)
router.get('/getAllUsers', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get product quantities (example route)
router.get('/productQuantities', async (req, res) => {
    try {
           // Find one product from DB
        const product = await Product.findOne();
        if (!product) {
            return res.status(404).send("Product not found");
        }
        
        // Send product details as response
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});



// Export router so it can be used in index.js or app.js
module.exports = router