const express = require('express'); // Import express to create routes

const fetchAdmin = require('../middleware/fetchAdmin');// Import middleware to check if admin is logged in (not used in this code yet)
const Item = require('../models/Items');// Import Item model (MongoDB collection for storing items)
const router = express.Router(); // Create a router object

// add items 
router.post('/add',  async (req, res) => {
    try {
        // take the items from the request body
        const { items } = req.body;

        if (typeof items !== 'object' || !items) {
            return res.status(400).send("Invalid items object");
        }

        // Fetch the single item document
        let itemDoc = await Item.findOne();
     // If no document exists → create a new one with empty Map
        if (!itemDoc) {
            itemDoc = new Item({ items: new Map() });
        }

        // Loop through all items sent in request
        // Update items
        for (const [key, value] of Object.entries(items)) {
            // Check if value is a number and not negative
            if (typeof value !== 'number' || value < 0) {
                return res.status(400).send("Invalid quantity for item: " + key);
            }
              // If item already exists → add to its quantity
            if (itemDoc.items.has(key)) {
                itemDoc.items.set(key, itemDoc.items.get(key) + value);
            } else {
              
                // Otherwise add new item with given quantity
                itemDoc.items.set(key, value);
            }
        }
        
        // Save changes in database
        await itemDoc.save();
         // Send back updated item document
        res.json(itemDoc);
    } catch (error) {
        // Print error in console
        console.error(error);
        // / Send error response
        res.status(500).send("Internal server error");
    }
});

// Route to get all items
router.get('/all', async (req, res) => {
    try {
        // fetch the single items documnets 
        let itemDoc = await Item.findOne();

        // if no items exits in DB
        if (!itemDoc) {
            return res.status(404).send("Items not found");
        }
      // return all items 
        res.json(itemDoc.items);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

// Route to remove specified quantity of items
router.post('/remove', async (req, res) => {
    try {
        // take items from request body
        const { items } = req.body;

        // check if items is a valid object
        if (typeof items !== 'object' || !items) {
            return res.status(400).send("Invalid items object");
        }

        // Fetch the single item document
        let itemDoc = await Item.findOne();
      

        // if no items found 
        if (!itemDoc) {
            return res.status(404).send("Items not found");
        }

        // Update items
        for (const [key, value] of Object.entries(items)) {
            if (typeof value !== 'number' || value < 0) {
                return res.status(400).send("Invalid quantity for item: " + key);
            }
            if (itemDoc.items.has(key)) {
                let currentQuantity = itemDoc.items.get(key);
                if (currentQuantity < value) {
                    return res.status(400).send(`Cannot remove more items than available for: ${key}`);
                }
                // itemDoc.items.set(key, currentQuantity - value);


                let newQuantity = currentQuantity - value;
                if (newQuantity === 0) {
                    itemDoc.items.delete(key);
                } else {
                    itemDoc.items.set(key, newQuantity);
                }
            } else {
                return res.status(400).send(`Item not found: ${key}`);
            }
        }
// Save updated document
        await itemDoc.save();
        // Return updated items
        res.json(itemDoc);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
