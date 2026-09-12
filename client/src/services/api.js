import axios from "axios";

const API = axios.create({
    baseURL: "http://192.168.1.11:5000/api"
});


// Get global COVID statistics
export const getGlobalStats = async () => {
    const response = await API.get("/covid/global");

    return response.data;
};


// Get country statistics
export const getCountryStats = async (country) => {
    const response = await API.get(
        `/covid/country/${country}`
    );

    return response.data;
};


// Get historical statistics
export const getHistoricalStats = async (country) => {
    const response = await API.get(
        `/covid/historical/${country}`
    );

    return response.data;
};


// Get list of all available countries
export const getCountriesList = async () => {
    const response = await API.get("/covid/countries");
    return response.data;
};


// Get top affected countries
export const getTopCountries = async (limit = 10) => {
    const response = await API.get(`/covid/top?limit=${limit}`);
    return response.data;
};

export default API;