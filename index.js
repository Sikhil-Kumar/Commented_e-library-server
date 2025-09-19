const connectToMongo = require("./db")
const express = require('express')
const cors = require('cors')
const path = require('path');

connectToMongo();

const app = express();
const port = 4000;

app.use(cors())

app.use(express.json())


app.use('/api/users', require('./routes/user'))

app.use('/product', require('./routes/products'))

app.use('/api/serviceProvider', require('./routes/serviceProvider'))

app.use('/item', require('./routes/items'))

app.use('/selectedOnes', require('./routes/selecteditem'))

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})