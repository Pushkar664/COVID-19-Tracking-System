const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");
    } catch (error) {
        console.warn("MongoDB connection warning:", error.message, "(Server will continue using live WHO API data)");
    }
};

module.exports = connectDB;