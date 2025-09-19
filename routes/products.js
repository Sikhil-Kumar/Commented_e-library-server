const express = require('express')
const fetchstudent = require('../middleware/fetchstudent')
const Product = require('../models/Product')
const router = express.Router()

const { query, matchedData, body, validationResult } = require('express-validator');

//router 0
//Get all user's data alltogether

router.get('/getallUsersProduct', async (req, res) => {
    try {
        const data = await Product.find();
        if (data.length === 0) {
            res.send("No product to display");
        } else {
            res.json(data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
})


//router1
//get all Data

router.get('/fetchAllProductsOfAUser', fetchstudent, async (req, res) => {
    const data = await Product.find({ user: req.user.id })
    res.json(data)
})

//router 2
//Add the data

router.post('/addProduct', fetchstudent, [

    body('crane', "Crane value must be a number").isNumeric(),
    body('pulley', "Pulley value must be a number").isNumeric(),
    body('ballbearings', "Ball bearings value must be a number").isNumeric(),
    body('grece', "Grece value must be a number").isNumeric()

], async (req, res) => {

    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { crane, pulley, ballbearings, grece } = req.body;

        const newProduct = new Product({
            user: req.user.id,
            crane,
            pulley,
            ballbearings,
            grece
        });

        const saveProduct = await newProduct.save();
        res.json(saveProduct);


    }
    catch (error) {
        console.log(error);
        return res.status(401).json({ error: "Internal server Error" });

    }

})

//router 3
//update data

router.put('/updateProduct/:id', fetchstudent, async (req, res) => {

    try {

        const { crane, pulley, ballbearings, grece } = req.body;

        // Create an object to hold the updated fields
        const newProduct = {};
        if (crane) newProduct.crane = crane;
        if (pulley) newProduct.pulley = pulley;
        if (ballbearings) newProduct.ballbearings = ballbearings;
        if (grece) newProduct.grece = grece;

        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Not found");
        }

        // Ensure the user owns this product
        if (product.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        product = await Product.findByIdAndUpdate(req.params.id, { $set: newProduct }, { new: true });
        res.json(product);
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({ error: "Internal server Error" });

    }

})

//router 4
//delete data

router.delete('/deleteProduct/:id', fetchstudent, async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Not found");
        }

        // Ensure the user owns this product
        if (product.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: "Product deleted" });

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})



router.put('/incrementProduct', fetchstudent, async (req, res) => {
    try {
        const { field } = req.body;

        if (!field) {
            return res.status(400).send("Field to increment is required");
        }

        let product = await Product.findOne({ user: req.user.id });
        if (!product) {
            // If no product exists for the user, create a new one with the specified field set to 1
            product = new Product({
                user: req.user.id,
                [field]: 1
            });
        } else {
            // If product exists, increment the specified field by 1
            product[field] = (product[field] || 0) + 1;
        }

        await product.save();
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});




router.put('/decrementProduct', fetchstudent, async (req, res) => {
    try {
        const { field } = req.body;

        if (!field) {
            return res.status(400).send("Field to decrement is required");
        }

        let product = await Product.findOne({ user: req.user.id });
        if (!product) {
            return res.status(404).send("No products found for this user");
        }

        // Decrement the specified field by 1, ensuring it does not go below zero
        product[field] = (product[field] > 0 ? product[field] - 1 : 0);

        await product.save();
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});


module.exports = router;