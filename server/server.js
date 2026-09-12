const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const covidRoutes = require("./routes/covidRoutes");

dotenv.config();


// MongoDB
connectDB();


const app = express();


// Middleware
app.use(cors());

app.use(express.json());


// Home
app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "COVID-19 Tracker API is running"
    });

});


// COVID routes
app.use(
    "/api/covid",
    covidRoutes
);

console.log("Top countries route registered");
console.log("COVID routes loaded");

// Server
const PORT =
    process.env.PORT || 5000;



app.listen(PORT, "0.0.0.0",() => {

    console.log(
        `Server running on port ${PORT}`
    );

});