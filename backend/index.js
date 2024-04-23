const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');

//routes import to index.js
const userRoutes = require('./routes/userRoutes')

const app = express();

//middleware
app.use(cors());
app.use(express.json());

app.use("/api", userRoutes)


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);

    mongoose.connect(process.env.URL).then(() => {
        console.log("Connected to MongoDB");
    }).catch((err) => {
        console.log("db connection has following errors\n" + err)
    })
})