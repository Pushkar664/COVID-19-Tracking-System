const axios = require("axios");
const { parse } = require("csv-parse/sync");

// =====================================================
// WHO API - Used for historical data
// =====================================================

const WHO_COVID_URL =
    "https://srhdpeuwpubsa.blob.core.windows.net/whdh/COVID/WHO-COVID-19-global-daily-data.csv";

let cachedRecords = null;
let lastFetchTime = 0;

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour


const getWHOData = async () => {
    const now = Date.now();

    if (
        cachedRecords &&
        now - lastFetchTime < CACHE_TTL_MS
    ) {
        return cachedRecords;
    }

    try {
        const response = await axios.get(WHO_COVID_URL, {
            timeout: 15000
        });

        const records = parse(response.data, {
            columns: true,
            skip_empty_lines: true
        });

        cachedRecords = records;
        lastFetchTime = now;

        return records;

    } catch (err) {

        if (cachedRecords) {
            console.warn(
                "WHO CSV refresh failed. Using cached data:",
                err.message
            );

            return cachedRecords;
        }

        throw err;
    }
};


// =====================================================
// Disease.sh API
// Used for Cases / Deaths / Recovered / Active
// =====================================================

const DISEASE_API_URL =
    "https://disease.sh/v3/covid-19";


// =====================================================
// Get global statistics
// =====================================================

const getGlobalData = async () => {

    try {

        const response = await axios.get(
            `${DISEASE_API_URL}/all`,
            {
                timeout: 15000
            }
        );

        const data = response.data;

        return {
            cases: Number(data.cases || 0),
            deaths: Number(data.deaths || 0),
            recovered: Number(data.recovered || 0),
            active: Number(data.active || 0),
            todayCases: Number(data.todayCases || 0),
            todayDeaths: Number(data.todayDeaths || 0),
            todayRecovered: Number(data.todayRecovered || 0),
            countries: Number(data.affectedCountries || 0)
        };

    } catch (error) {

        console.error(
            "Disease.sh global API error:",
            error.message
        );

        throw error;
    }
};


// =====================================================
// Get country statistics
// =====================================================

const getCountryData = async (countryName) => {

    try {

        const response = await axios.get(
            `${DISEASE_API_URL}/countries/${encodeURIComponent(countryName)}`,
            {
                timeout: 15000
            }
        );

        const data = response.data;

        return {
            country: data.country,

            countryCode:
                data.countryInfo?.iso2 ||
                data.countryInfo?.iso3 ||
                "",

            date: new Date(
                data.updated
            ).toISOString().split("T")[0],

            cases: Number(data.cases || 0),

            deaths: Number(data.deaths || 0),

            recovered: Number(data.recovered || 0),

            active: Number(data.active || 0),

            todayCases: Number(data.todayCases || 0),

            todayDeaths: Number(data.todayDeaths || 0),

            todayRecovered:
                Number(data.todayRecovered || 0)
        };

    } catch (error) {

        console.error(
            `Disease.sh country API error for ${countryName}:`,
            error.message
        );

        return null;
    }
};


// =====================================================
// Get historical country data
// WHO data is retained for your Recharts graph
// =====================================================

const getCountryHistory = async (countryName) => {

    const records = await getWHOData();

    const countryRecords = records.filter(
        (record) =>
            record.Country &&
            (
                record.Country.toLowerCase() ===
                countryName.toLowerCase()

                ||

                (
                    record.Country_code &&
                    record.Country_code.toLowerCase() ===
                    countryName.toLowerCase()
                )
            )
    );

    return countryRecords.map((record) => ({

        date: record.Date_reported,

        cases:
            Number(record.Cumulative_cases || 0),

        deaths:
            Number(record.Cumulative_deaths || 0),

        newCases:
            Number(record.New_cases || 0),

        newDeaths:
            Number(record.New_deaths || 0)

    }));
};


// =====================================================
// Get list of all available countries
// =====================================================

const getCountriesList = async () => {

    const records = await getWHOData();

    const countriesSet = new Set();

    records.forEach((record) => {

        if (record.Country) {
            countriesSet.add(record.Country);
        }

    });

    return Array.from(countriesSet).sort();
};


// =====================================================
// Get top affected countries
// =====================================================

const getTopCountries = async (limit = 10) => {

    try {

        const response = await axios.get(
            `${DISEASE_API_URL}/countries`,
            {
                timeout: 15000
            }
        );

        const countries = response.data.map((record) => ({

            country: record.country,

            countryCode:
                record.countryInfo?.iso2 ||
                record.countryInfo?.iso3 ||
                "",

            cases: Number(record.cases || 0),

            deaths: Number(record.deaths || 0),

            recovered:
                Number(record.recovered || 0),

            active:
                Number(record.active || 0),

            newCases:
                Number(record.todayCases || 0),

            newDeaths:
                Number(record.todayDeaths || 0)

        }));

        countries.sort(
            (a, b) => b.cases - a.cases
        );

        return countries.slice(0, limit);

    } catch (error) {

        console.error(
            "Disease.sh top countries API error:",
            error.message
        );

        throw error;
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getGlobalData,

    getCountryData,

    getCountryHistory,

    getCountriesList,

    getTopCountries

};