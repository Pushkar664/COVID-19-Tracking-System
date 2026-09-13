const express = require("express");

const {
    globalStats,
    countryStats,
    historicalStats,
    globalHistoricalStats,
    listCountries,
    topCountries
} = require("../controllers/covidController");

const router = express.Router();


// Global
router.get("/global", globalStats);

// List of all countries
router.get("/countries", listCountries);

// Top affected countries
router.get("/top-countries", topCountries);

router.get("/historical-global", globalHistoricalStats);

// Country
router.get(
    "/country/:country",
    countryStats
);

// Historical
router.get(
    "/historical/:country",
    historicalStats
);


module.exports = router;