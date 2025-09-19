// Importing express to create routes
const express = require('express');
// Initializing router from express
const router = express.Router();
// Importing the SelectedItem schema (for storing user-selected items)
const SelectedItem = require('../models/SelectedItemSchema');
// Importing middleware to authenticate user using JWT
const fetchstudent = require('../middleware/fetchstudent');
// Importing the Item schema (contains all available items and their stock)
const Item = require('../models/Items');


// add selected items routes 
router.post('/selected-items/add', fetchstudent, async (req, res) => {
  // Extracting item name and quantity from request body
  const { item, quantity } = req.body;

  try {
      // Finding the items collection that contains the items map
      const itemsDocument = await Item.findOne({ "items": { $exists: true } });
      
      // If items collection is empty or item does not exist in the map
      if (!itemsDocument || !itemsDocument.items.has(item)) {
          console.log('Original item not found');
          return res.status(400).json({ error: 'Item not found' });
      }

      // Getting the available quantity of the item from the items map
      const originalQuantity = itemsDocument.items.get(item);

      // If user requests more than available stock
      if (originalQuantity < quantity) {
          return res.status(400).json({ error: 'Insufficient stock available' });
      }

      // Checking if this item was already selected by the user
      let selectedItem = await SelectedItem.findOne({ user: req.user.id, item });

      // If user already has this item in selected list
      if (selectedItem) {
          // Preventing user from exceeding the available stock
          if (selectedItem.quantity + quantity > originalQuantity) {
              return res.status(400).json({ error: 'Total selected quantity exceeds available stock' });
          }
          // Increasing the quantity of already selected item
          selectedItem.quantity += quantity;
          await selectedItem.save();
      } else {
          // If user selects this item for the first time, create new entry
          selectedItem = new SelectedItem({
              user: req.user.id,
              item,
              quantity
          });
          await selectedItem.save();
      }

      // (Optional) Reduce stock in original Item collection, but currently commented
      // itemsDocument.items.set(item, originalQuantity - quantity);
      // await itemsDocument.save();

      // Returning updated selected items of the user
      const updatedItems = await SelectedItem.find({ user: req.user.id });
      res.json(updatedItems);
  } catch (error) {
      // Handling unexpected server errors
      console.error(error);
      res.status(500).send('Internal server error');
  }
});


// remove selected items routes
router.post('/selected-items/remove', fetchstudent, async (req, res) => {
  // Extracting item and quantity to remove from request body
  const { item, quantity } = req.body;

  try {
      // Checking if the user has this item in their selected list
      const selectedItem = await SelectedItem.findOne({ user: req.user.id, item });

      // If user hasn’t selected this item
      if (!selectedItem) {
          return res.status(404).json({ error: 'Selected item not found' });
      }

      // If user tries to remove more than they actually selected
      if (selectedItem.quantity < quantity) {
          return res.status(400).json({ error: 'Cannot remove more items than available' });
      }

      // Reduce the selected quantity
      selectedItem.quantity -= quantity;

      // If quantity becomes 0 or less, remove item from selected list
      if (selectedItem.quantity <= 0) {
          await SelectedItem.deleteOne({ _id: selectedItem._id });
      } else {
          // Otherwise just update the reduced quantity
          await selectedItem.save();
      }

   
      const updatedItems = await SelectedItem.find({ user: req.user.id });
      res.json(updatedItems);
  } catch (error) {
      // Handling unexpected errors
      console.error(error);
      res.status(500).send('Internal server error');
  }
});


// get all selected item routes 
router.get('/selected-items/getallItems', fetchstudent, async (req, res) => {
    // Getting the authenticated user's ID from request
    const userId =  req.user.id;

    try {
        // Fetching all selected items of the user from database
        const selectedItems = await SelectedItem.find({ user: userId });

        // Returning the items to frontend
        res.json(selectedItems);
    } catch (error) {
        // Handling unexpected errors
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

// Exporting the router so it can be used in index.js or server.js
module.exports = router;
