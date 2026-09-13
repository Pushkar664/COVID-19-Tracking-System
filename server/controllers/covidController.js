const {
    getGlobalData,
    getCountryData,
    getCountryHistory,
    getGlobalHistory,
    getCountriesList,
    getTopCountries
} = require("../services/covidApi");


// Global statistics
const globalStats = async (req, res) => {
    try {
        const data = await getGlobalData();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Global COVID data error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to fetch global COVID data"
        });
    }
};


// Country statistics
const countryStats = async (req, res) => {
    try {
        const { country } = req.params;
        const data = await getCountryData(country);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Country not found"
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Country COVID data error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to fetch country COVID data"
        });
    }
};


// Historical statistics
const historicalStats = async (req, res) => {
    try {
        const { country } = req.params;
        const data = await getCountryHistory(country);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Historical COVID data error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to fetch historical data"
        });
    }
};

// Global historical statistics
const globalHistoricalStats = async (req, res) => {
    try {
        const data = await getGlobalHistory();

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Global historical COVID data error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch global historical data"
        });
    }
};


// List available countries
const listCountries = async (req, res) => {
    try {
        const data = await getCountriesList();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Countries list error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to fetch countries list"
        });
    }
};


// Top affected countries
const topCountries = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const data = await getTopCountries(limit);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Top countries error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to fetch top countries"
        });
    }
};


module.exports = {
    globalStats,
    countryStats,
    historicalStats,
    globalHistoricalStats,
    listCountries,
    topCountries
};