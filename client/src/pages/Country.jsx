import { useEffect, useState } from "react";
import "./Country.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://192.168.1.11:5000/api/covid";

function Country() {
  // =========================================
  // RECENT SEARCHES
  // =========================================

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentCountries")) || [];
    } catch {
      return [];
    }
  });

  // =========================================
  // STATES
  // =========================================

  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const [data, setData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // FETCH COUNTRY LIST
  // =========================================

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true);

        const response = await fetch(`${API_URL}/countries`);

        if (!response.ok) {
          throw new Error("Unable to fetch countries");
        }

        const result = await response.json();

        const countryList = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
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
  // GET VALUE FROM OBJECT
  // =========================================

  const getObjectValue = (object, keys) => {
    if (!object || typeof object !== "object") {
      return null;
    }

    for (const key of keys) {
      if (
        object[key] !== undefined &&
        object[key] !== null &&
        object[key] !== ""
      ) {
        const value = Number(object[key]);

        if (!Number.isNaN(value)) {
          return value;
        }
      }
    }

    return null;
  };

  // =========================================
  // GET VALUE FROM API RESPONSE
  // =========================================

  const getValue = (keys) => {
    if (!data) {
      return null;
    }

    // Direct response
    const directValue = getObjectValue(data, keys);

    if (directValue !== null) {
      return directValue;
    }

    // Nested response
    if (data.data && typeof data.data === "object") {
      return getObjectValue(data.data, keys);
    }

    return null;
  };

  // =========================================
  // FETCH COUNTRY DATA
  // =========================================

  const fetchCountryData = async (searchedCountry) => {
    const trimmedCountry = searchedCountry.trim();

    if (!trimmedCountry) {
      setError("Please select a country.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setData(null);
      setHistoricalData([]);

      // =====================================
      // CURRENT DATA
      // =====================================

      const response = await fetch(
        `${API_URL}/country/${encodeURIComponent(trimmedCountry)}`
      );

      if (!response.ok) {
        throw new Error("Country not found");
      }

      const result = await response.json();

      console.log("Country COVID Data:", result);

      if (!result) {
        throw new Error("Invalid country data");
      }

      setData(result);

      // =====================================
      // SAVE RECENT SEARCH
      // =====================================

      setRecentSearches((previousSearches) => {
        const updatedSearches = [
          trimmedCountry,
          ...previousSearches.filter(
            (item) =>
              item.toLowerCase() !== trimmedCountry.toLowerCase()
          ),
        ].slice(0, 5);

        localStorage.setItem(
          "recentCountries",
          JSON.stringify(updatedSearches)
        );

        return updatedSearches;
      });

      // =====================================
      // HISTORICAL DATA
      // =====================================

      try {
        const historicalResponse = await fetch(
          `${API_URL}/historical/${encodeURIComponent(trimmedCountry)}`
        );

        if (!historicalResponse.ok) {
          return;
        }

        const historicalResult = await historicalResponse.json();

        console.log("Historical Data:", historicalResult);

        const history = Array.isArray(historicalResult)
          ? historicalResult
          : Array.isArray(historicalResult?.data)
          ? historicalResult.data
          : [];

        const formattedHistory = history
          .map((item) => {
            const cases = getObjectValue(item, [
              "cases",
              "totalCases",
              "TotalCases",
              "confirmed",
              "Confirmed",
            ]);

            const deaths = getObjectValue(item, [
              "deaths",
              "totalDeaths",
              "TotalDeaths",
              "Deaths",
            ]);

            const recoveredFromAPI = getObjectValue(item, [
              "recovered",
              "totalRecovered",
              "TotalRecovered",
              "Recovered",
            ]);

            const active = getObjectValue(item, [
              "active",
              "activeCases",
              "ActiveCases",
              "Active",
            ]);

            let recovered = recoveredFromAPI;

            // Calculate recovered if API doesn't provide it
            if (
              (recovered === null || recovered <= 0) &&
              cases !== null &&
              deaths !== null &&
              active !== null
            ) {
              recovered = Math.max(
                cases - deaths - active,
                0
              );
            }

            return {
              date:
                item.date ||
                item.Date ||
                item.timestamp ||
                "",

              cases: cases ?? 0,
              deaths: deaths ?? 0,
              recovered: recovered ?? 0,
            };
          })
          .filter((item) => item.date !== "");

        setHistoricalData(formattedHistory);
      } catch (historicalError) {
        console.error(
          "Historical data error:",
          historicalError
        );

        setHistoricalData([]);
      }
    } catch (err) {
      console.error("Country search error:", err);

      setData(null);
      setHistoricalData([]);

      setError(
        "Country data not found. Please select another country."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SEARCH
  // =========================================

  const searchCountry = async (e) => {
    e.preventDefault();

    await fetchCountryData(country);
  };

  // =========================================
  // RECENT COUNTRY
  // =========================================

  const searchRecentCountry = async (countryName) => {
    setCountry(countryName);
    await fetchCountryData(countryName);
  };

  // =========================================
  // FORMAT NUMBER
  // =========================================

  const formatNumber = (number) => {
    if (
      number === undefined ||
      number === null ||
      number === ""
    ) {
      return "Unavailable";
    }

    const numericValue = Number(number);

    if (Number.isNaN(numericValue)) {
      return "Unavailable";
    }

    return numericValue.toLocaleString("en-IN");
  };

  // =========================================
  // COVID STATISTICS
  // =========================================

  const cases = getValue([
    "totalCases",
    "cases",
    "TotalCases",
    "confirmed",
    "Confirmed",
  ]);

  const deaths = getValue([
    "totalDeaths",
    "deaths",
    "TotalDeaths",
    "Deaths",
  ]);

  const recoveredFromAPI = getValue([
    "totalRecovered",
    "recovered",
    "TotalRecovered",
    "Recovered",
  ]);

  const activeFromAPI = getValue([
    "activeCases",
    "active",
    "ActiveCases",
    "Active",
  ]);

  // =========================================
  // RECOVERED CALCULATION
  // =========================================

  const recovered =
    recoveredFromAPI !== null && recoveredFromAPI > 0
      ? recoveredFromAPI
      : cases !== null &&
        deaths !== null &&
        activeFromAPI !== null
      ? Math.max(
          cases - deaths - activeFromAPI,
          0
        )
      : recoveredFromAPI;

  // =========================================
  // ACTIVE CALCULATION
  // =========================================

  const active =
    activeFromAPI !== null && activeFromAPI >= 0
      ? activeFromAPI
      : cases !== null &&
        deaths !== null &&
        recovered !== null
      ? Math.max(
          cases - deaths - recovered,
          0
        )
      : null;

  // =========================================
  // COUNTRY NAME
  // =========================================

  const displayCountry =
    data?.data?.country ||
    data?.data?.name ||
    data?.country ||
    data?.name ||
    country;

  // =========================================
  // RETURN
  // =========================================

  return (
    <div className="country-page">

      {/* =====================================
          HERO
      ====================================== */}

      <section className="country-hero">
        <div>
          <span className="country-badge">
            COUNTRY STATISTICS
          </span>

          <h1>
            COVID-19 Country Tracker
          </h1>

          <p>
            Search for a country to view its
            latest COVID-19 statistics.
          </p>
        </div>

        <div className="country-hero-icon">
          🌍
        </div>
      </section>

      {/* =====================================
          SEARCH
      ====================================== */}

      <section className="country-search-section">

        <h2>
          Search Country
        </h2>

        <p>
          Select a country to view COVID-19 statistics.
        </p>

        <form
          className="country-search-form"
          onSubmit={searchCountry}
        >

          <select
            className="country-dropdown"
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
            disabled={
              countriesLoading || loading
            }
          >

            <option value="">
              {countriesLoading
                ? "Loading countries..."
                : "Select a country"}
            </option>

            {countries.map(
              (countryName, index) => (
                <option
                  key={`${countryName}-${index}`}
                  value={countryName}
                >
                  {countryName}
                </option>
              )
            )}

          </select>

          <button
            type="submit"
            disabled={
              loading || !country
            }
          >
            {loading
              ? "Searching..."
              : "Search"}
          </button>

        </form>

        {/* ERROR */}

        {error && (
          <div className="country-error">
            ⚠️ {error}
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="country-loading">
            <div className="loading-spinner"></div>
            Loading COVID-19 data...
          </div>
        )}

        {/* RECENT SEARCHES */}

        {recentSearches.length > 0 && (
          <div className="recent-searches">

            <h3>
              🕘 Recent Searches
            </h3>

            <div className="recent-search-list">

              {recentSearches.map(
                (item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      searchRecentCountry(item)
                    }
                  >
                    🌍 {item}
                  </button>
                )
              )}

            </div>

          </div>
        )}

      </section>

      {/* =====================================
          RESULTS
      ====================================== */}

      {data && (
        <section className="country-results-page">

          {/* RESULT HEADER */}

          <div className="country-result-header">

            <div>
              <span>
                RESULT
              </span>

              <h2>
                {displayCountry}
              </h2>
            </div>

            <div className="result-globe">
              🌍
            </div>

          </div>

          {/* STATISTICS */}

          <div className="country-stats-grid">

            <div className="country-card cases">
              <div className="country-card-icon">
                🧪
              </div>

              <p>
                Total Cases
              </p>

              <h3>
                {formatNumber(cases)}
              </h3>
            </div>

            <div className="country-card deaths">
              <div className="country-card-icon">
                ⚠️
              </div>

              <p>
                Total Deaths
              </p>

              <h3>
                {formatNumber(deaths)}
              </h3>
            </div>

            <div className="country-card recovered">
              <div className="country-card-icon">
                ✓
              </div>

              <p>
                Recovered
              </p>

              <h3>
                {formatNumber(recovered)}
              </h3>
            </div>

            <div className="country-card active">
              <div className="country-card-icon">
                📊
              </div>

              <p>
                Active Cases
              </p>

              <h3>
                {formatNumber(active)}
              </h3>
            </div>

          </div>

          {/* =====================================
              HISTORICAL CHART
          ====================================== */}

          <div className="historical-chart">

            <div className="chart-header">

              <span>
                📈
              </span>

              <div>
                <h2>
                  Historical COVID-19 Data
                </h2>

                <p>
                  COVID-19 statistics over time
                </p>
              </div>

            </div>

            {historicalData.length > 0 ? (
              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={historicalData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 65,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="date"
                      angle={-30}
                      textAnchor="end"
                      height={65}
                      interval="preserveStartEnd"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      height={35}
                    />

                    <Line
                      type="monotone"
                      dataKey="cases"
                      name="Cases"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="deaths"
                      name="Deaths"
                      stroke="#dc2626"
                      strokeWidth={3}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="recovered"
                      name="Recovered"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={false}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>
            ) : (
              <p className="no-history">
                Historical data is not available
                for this country.
              </p>
            )}

          </div>

        </section>
      )}

      {/* =====================================
          INFORMATION
      ====================================== */}

      <section className="country-info">

        <div>
          <span>📌</span>

          <div>
            <h3>
              How to use
            </h3>

            <p>
              Select a country from the dropdown
              and click Search to view its
              COVID-19 statistics.
            </p>
          </div>
        </div>

        <div>
          <span>📊</span>

          <div>
            <h3>
              Available Statistics
            </h3>

            <p>
              The tracker displays total cases,
              deaths, recovered patients and
              active cases.
            </p>
          </div>
        </div>

        <div>
          <span>🧮</span>

          <div>
            <h3>
              Recovered Data
            </h3>

            <p>
              If recovered data is unavailable,
              it may be calculated using total
              cases, deaths and active cases.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}

export default Country;