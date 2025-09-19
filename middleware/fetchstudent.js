const jwt = require('jsonwebtoken');// Importing the jsonwebtoken library so we can check and decode JWT tokens

// Secret key used to create and verify JWT tokens
const JWT_SECRET = "You are a good boy"


// Middleware function to check if the student is logged in using JWT
const fetchstudent = (req, res, next) => {
    //Get the user from the jwt token and add id to req object

    const token = req.header('auth-token');

        // If no token is found → stop and send error response

    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" })
    }

    try {
         // Verify the token with the secret key → this gives us back the data inside the token

        const data = jwt.verify(token, JWT_SECRET)

        // Store the student data (from token) into req.user, so other routes can use it
        req.user = data.user

        // Call next() → move to the next middleware or route
        next()

    } catch (error) {
        // If something goes wrong (like invalid token), catch the error
        console.log(error);
        // Send error response back with the actual error
        return res.status(401).json({ error: error });
    }

}
// Export this function so it can be used in other files
module.exports = fetchstudent;