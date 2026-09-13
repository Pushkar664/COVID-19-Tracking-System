import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./Compare.css";

const API_URL = "http://192.168.1.11:5000/api/covid";

function Compare() {
  // =========================================
  // STATES
  // =========================================

  const [countryA, setCountryA] = useState("");
  const [countryB, setCountryB] = useState("");

  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // FETCH COUNTRY LIST
  // =========================================

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/countries`);

        if (!response.ok) {
          throw new Error("Unable to fetch countries");
        }

        const result = await response.json();

        // API can return:
        // ["India", "USA", ...]
        //
        // OR:
        // { success: true, data: [...] }

        const countryList = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
          ? result.data
          : [];

        setCountries(countryList);
      } catch (err) {
        console.error("Countries list error:", err);
        setError("Unable to load country list.");
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // =========================================
  // FETCH COUNTRY DATA
  // =========================================

  const fetchCountry = async (countryName) => {
    const response = await fetch(
      `${API_URL}/country/${encodeURIComponent(countryName)}`
    );

    if (!response.ok) {
      throw new Error(`Unable to fetch data for ${countryName}`);
    }

    const result = await response.json();

    /*
      Handle different possible API structures:

      1.
      {
        success: true,
        data: {
          country: "India",
          cases: 100,
          deaths: 2,
          recovered: 90,
          active: 8
        }
      }

      2.
      {
        data: {...}
      }

      3.
      {
        country: "India",
        cases: 100
      }
    */

    if (result && result.success === true && result.data) {
      return result.data;
    }

    if (result && result.data) {
      return result.data;
    }

    if (result && result.country) {
      return result;
    }

    return result;
  };

  // =========================================
  // GET VALUE FROM COUNTRY DATA
  // =========================================

  const getCountryValue = (countryData, keys) => {
    if (!countryData) {
      return null;
    }

    // Check direct object
    for (const key of keys) {
      if (
        countryData[key] !== undefined &&
        countryData[key] !== null &&
        countryData[key] !== ""
      ) {
        const value = Number(countryData[key]);

        if (!Number.isNaN(value)) {
          return value;
        }
      }
    }

    // Check nested data object
    if (countryData.data && typeof countryData.data === "object") {
      for (const key of keys) {
        if (
          countryData.data[key] !== undefined &&
          countryData.data[key] !== null &&
          countryData.data[key] !== ""
        ) {
          const value = Number(countryData.data[key]);

          if (!Number.isNaN(value)) {
            return value;
          }
        }
      }
    }

    return null;
  };

  // =========================================
  // GET COUNTRY NAME
  // =========================================

  const getCountryName = (countryData, fallback) => {
    if (!countryData) {
      return fallback;
    }

    return (
      countryData.country ||
      countryData.name ||
      countryData.Country ||
      countryData.data?.country ||
      countryData.data?.name ||
      fallback
    );
  };

  // =========================================
  // COMPARE COUNTRIES
  // =========================================

  const compareCountries = async () => {
    setError("");

    if (!countryA || !countryB) {
      setError("Please select both countries.");
      return;
    }

    if (countryA === countryB) {
      setError("Please select two different countries.");
      return;
    }

    try {
      setLoading(true);

      const [resultA, resultB] = await Promise.all([
        fetchCountry(countryA),
        fetchCountry(countryB),
      ]);

      setDataA(resultA);
      setDataB(resultB);
    } catch (err) {
      console.error("Compare error:", err);
      setError("Unable to fetch comparison data. Please try again.");
      setDataA(null);
      setDataB(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // CLEAR COMPARISON
  // =========================================

  const clearComparison = () => {
    setCountryA("");
    setCountryB("");
    setDataA(null);
    setDataB(null);
    setError("");
  };

  // =========================================
  // NUMBER FORMAT
  // =========================================

  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return "Unavailable";
    }

    return Number(value).toLocaleString();
  };

  // =========================================
  // COUNTRY A STATISTICS
  // =========================================

  const casesA = getCountryValue(dataA, [
    "totalCases",
    "cases",
    "TotalCases",
    "confirmed",
    "Confirmed",
  ]);

  const deathsA = getCountryValue(dataA, [
    "totalDeaths",
    "deaths",
    "TotalDeaths",
    "Deaths",
  ]);

  const recoveredAFromAPI = getCountryValue(dataA, [
    "totalRecovered",
    "recovered",
    "TotalRecovered",
    "Recovered",
  ]);

  const activeAFromAPI = getCountryValue(dataA, [
    "activeCases",
    "active",
    "ActiveCases",
    "Active",
  ]);

  /*
    IMPORTANT RECOVERED FIX

    If recovered is available from API,
    use it.

    Otherwise, if active cases are available:

    Recovered =
    Total Cases - Deaths - Active Cases
  */

  const recoveredA =
    recoveredAFromAPI !== null && recoveredAFromAPI > 0
      ? recoveredAFromAPI
      : casesA !== null &&
        deathsA !== null &&
        activeAFromAPI !== null
      ? Math.max(casesA - deathsA - activeAFromAPI, 0)
      : recoveredAFromAPI;

  /*
    Active Cases

    If API provides active cases, use it.

    Otherwise:

    Active =
    Total Cases - Deaths - Recovered
  */

  const activeA =
    activeAFromAPI !== null && activeAFromAPI >= 0
      ? activeAFromAPI
      : casesA !== null &&
        deathsA !== null &&
        recoveredA !== null
      ? Math.max(casesA - deathsA - recoveredA, 0)
      : null;

  // =========================================
  // COUNTRY B STATISTICS
  // =========================================

  const casesB = getCountryValue(dataB, [
    "totalCases",
    "cases",
    "TotalCases",
    "confirmed",
    "Confirmed",
  ]);

  const deathsB = getCountryValue(dataB, [
    "totalDeaths",
    "deaths",
    "TotalDeaths",
    "Deaths",
  ]);

  const recoveredBFromAPI = getCountryValue(dataB, [
    "totalRecovered",
    "recovered",
    "TotalRecovered",
    "Recovered",
  ]);

  const activeBFromAPI = getCountryValue(dataB, [
    "activeCases",
    "active",
    "ActiveCases",
    "Active",
  ]);

  /*
    IMPORTANT RECOVERED FIX

    If recovered is available from API,
    use it.

    Otherwise, if active cases are available:

    Recovered =
    Total Cases - Deaths - Active Cases
  */

  const recoveredB =
    recoveredBFromAPI !== null && recoveredBFromAPI > 0
      ? recoveredBFromAPI
      : casesB !== null &&
        deathsB !== null &&
        activeBFromAPI !== null
      ? Math.max(casesB - deathsB - activeBFromAPI, 0)
      : recoveredBFromAPI;

  /*
    Active Cases

    If API provides active cases, use it.

    Otherwise:

    Active =
    Total Cases - Deaths - Recovered
  */

  const activeB =
    activeBFromAPI !== null && activeBFromAPI >= 0
      ? activeBFromAPI
      : casesB !== null &&
        deathsB !== null &&
        recoveredB !== null
      ? Math.max(casesB - deathsB - recoveredB, 0)
      : null;

  // =========================================
  // DISPLAY COUNTRY NAMES
  // =========================================

  const displayCountryA = getCountryName(dataA, countryA);
  const displayCountryB = getCountryName(dataB, countryB);

  // =========================================
  // CHART DATA
  // =========================================

  const chartData =
    dataA && dataB
      ? [
          {
            statistic: "Total Cases",
            [displayCountryA]: casesA ?? 0,
            [displayCountryB]: casesB ?? 0,
          },
          {
            statistic: "Deaths",
            [displayCountryA]: deathsA ?? 0,
            [displayCountryB]: deathsB ?? 0,
          },
          {
            statistic: "Recovered",
            [displayCountryA]: recoveredA ?? 0,
            [displayCountryB]: recoveredB ?? 0,
          },
          {
            statistic: "Active",
            [displayCountryA]: activeA ?? 0,
            [displayCountryB]: activeB ?? 0,
          },
        ]
      : [];

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="compare-page">
      <div className="compare-container">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="compare-header">
          <h1>Compare Countries</h1>

          <p>
            Compare COVID-19 statistics between two countries.
          </p>
        </div>

        {/* =========================================
            SEARCH / SELECT SECTION
        ========================================= */}

        <div className="compare-search">

          {/* COUNTRY A */}

          <div className="country-select-box">
            <label htmlFor="countryA">
              Country 1
            </label>

            <select
              id="countryA"
              value={countryA}
              onChange={(e) => {
                setCountryA(e.target.value);

                // Clear second country if both become same
                if (e.target.value === countryB) {
                  setCountryB("");
                }
              }}
              disabled={countriesLoading}
            >
              <option value="">
                {countriesLoading
                  ? "Loading countries..."
                  : "Select Country"}
              </option>

              {countries.map((country, index) => (
                <option key={`${country}-${index}`} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* VS */}

          <div className="compare-vs">
            VS
          </div>

          {/* COUNTRY B */}

          <div className="country-select-box">
            <label htmlFor="countryB">
              Country 2
            </label>

            <select
              id="countryB"
              value={countryB}
              onChange={(e) => setCountryB(e.target.value)}
              disabled={countriesLoading}
            >
              <option value="">
                {countriesLoading
                  ? "Loading countries..."
                  : "Select Country"}
              </option>

              {countries
                .filter((country) => country !== countryA)
                .map((country, index) => (
                  <option key={`${country}-${index}`} value={country}>
                    {country}
                  </option>
                ))}
            </select>
          </div>

          {/* BUTTONS */}

          <div className="compare-buttons">
            <button
              className="compare-btn"
              onClick={compareCountries}
              disabled={loading || countriesLoading}
            >
              {loading ? "Comparing..." : "Compare"}
            </button>

            <button
              className="clear-btn"
              onClick={clearComparison}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>

        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div className="compare-error">
            {error}
          </div>
        )}

        {/* =========================================
            LOADING
        ========================================= */}

        {loading && (
          <div className="compare-loading">
            <p>Loading comparison data...</p>
          </div>
        )}

        {/* =========================================
            RESULTS
        ========================================= */}

        {!loading && dataA && dataB && (
          <div className="comparison-results">

            {/* =========================================
                COUNTRY CARDS
            ========================================= */}

            <div className="comparison-cards">

              {/* COUNTRY A CARD */}

              <div className="country-card">
                <div className="country-card-header">
                  <h2>{displayCountryA}</h2>
                </div>

                <div className="country-statistics">

                  {/* TOTAL CASES */}

                  <div className="stat-item">
                    <span className="stat-label">
                      Total Cases
                    </span>

                    <span className="stat-value">
                      {formatNumber(casesA)}
                    </span>
                  </div>

                  {/* DEATHS */}

                  <div className="stat-item">
                    <span className="stat-label">
                      Deaths
                    </span>

                    <span className="stat-value">
                      {formatNumber(deathsA)}
                    </span>
                  </div>

                  {/* RECOVERED */}

                  <div className="stat-item">
                    <span className="stat-label">
                      Recovered
                    </span>

                    <span className="stat-value">
                      {formatNumber(recoveredA)}
                    </span>
                  </div>

                  {/* ACTIVE */}

                  <div className="stat-item">
                    <span className="stat-label">
                      Active Cases
                    </span>

                    <span className="stat-value">
                      {formatNumber(activeA)}
                    </span>
                  </div>
                </div>
              </div>

              {/* COUNTRY B CARD */}

              <div className="country-card">
                <div className="country-card-header">
                  <h2>{displayCountryB}</h2>
                </div>

                <div className="country-statistics">

                  {/* TOTAL CASES */}

                  <div className="stat-item">
                    <span className="stat-label">
                      Total Cases
                    </span>

                    <span className="stat-value">
                      {formatNumber(casesB)}
                    </span>
                  </div>

                  {/* DEATHS */}

                  <div className="stat-item">
                    <span className="stat-label">
                      Deaths
                    </span>

                    <span className="stat-value">
                      {formatNumber(deathsB)}
                    </span>
                  </div>

                  {/* RECOVERED */}

                  <div className="stat-item">
                    <span className="stat-label">
                      Recovered
                    </span>

                    <span className="stat-value">
                      {formatNumber(recoveredB)}
                    </span>
                  </div>

                  {/* ACTIVE */}

                  <div className="stat-item">
                    <span className="stat-label">
                      Active Cases
                    </span>

                    <span className="stat-value">
                      {formatNumber(activeB)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================
                CHART
            ========================================= */}

            <div className="comparison-chart">

              <div className="chart-header">
                <h2>COVID-19 Statistics Comparison</h2>
              </div>

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={450}
                >
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="statistic"
                    />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey={displayCountryA}
                      name={displayCountryA}
                      fill="#2563eb"
                    />

                    <Bar
                      dataKey={displayCountryB}
                      name={displayCountryB}
                      fill="#ef4444"
                    />
                  </BarChart>
                </ResponsiveContainer>

              </div>
            </div>

            {/* =========================================
                INFORMATION
            ========================================= */}

            <div className="comparison-info">

              <h3>
                About the comparison
              </h3>

              <p>
                This comparison displays total COVID-19 cases,
                deaths, recovered patients, and active cases for
                the selected countries.
              </p>

              <p>
                When recovered patient data is not directly
                available from the API, it is calculated using:
              </p>

              <div className="formula">
                Recovered = Total Cases − Deaths − Active Cases
              </div>

              <p>
                Therefore, the recovered value may be an estimated
                value for countries where the original recovered
                statistic is not available.
              </p>

            </div>

          </div>
        )}

        {/* =========================================
            INITIAL MESSAGE
        ========================================= */}

        {!loading && !dataA && !dataB && !error && (
          <div className="compare-placeholder">
            <h2>Compare COVID-19 Data</h2>

            <p>
              Select two countries above to view their
              COVID-19 statistics side by side.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Compare;