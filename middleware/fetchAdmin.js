const jwt = require('jsonwebtoken') // Importing the jsonwebtoken library so we can work with JWT tokens

// Secret key that is used to sign and verify the JWT tokens
const JWT_SECRET = "You are a good boy heheheh"

// Middleware function to check if the admin is logged in using JWT
const fetchadmin = (req, res, next) => {
    //Get the user from the jwt token and add id to req object

    // Get the token from request header called 'auth-token'
    const token = req.header('auth-token')

     // If there is no token, send back an error (unauthorized)
    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" })
    }
 // Verify the token using the secret key, and get the data stored inside the token
    try {
        const data = jwt.verify(token, JWT_SECRET)
        
        // Add the admin info from token into the request object (so other routes can use it)
        req.admin = data.admin
         // Continue to the next middleware or route
        next()

    } catch (error) {
                // If token is invalid or something goes wrong, catch the error

        console.log(error);

        // Send error response for invalid token
        return res.status(401).json({ error: "Invalid token" });
    }

}
// Export this middleware so it can be used in other files
module.exports = fetchadmin;