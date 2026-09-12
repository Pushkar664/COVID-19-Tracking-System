import { useEffect,useState } from "react";
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
      return (
        JSON.parse(
          localStorage.getItem("recentCountries")
        ) || []
      );
    } catch {
      return [];
    }
  });

  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [data, setData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================
// FETCH COUNTRIES LIST
// =========================================

useEffect(() => {
  const fetchCountries = async () => {
    try {
      setCountriesLoading(true);

      const response = await fetch(
        `${API_URL}/countries`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch countries");
      }

      const result = await response.json();

      const countryList = Array.isArray(result)
        ? result
        : result.data || [];

      setCountries(countryList);
    } catch (err) {
      console.error(
        "Countries list error:",
        err
      );
    } finally {
      setCountriesLoading(false);
    }
  };

  fetchCountries();
}, []);

  // =========================================
  // FETCH COUNTRY DATA
  // =========================================

  const fetchCountryData = async (searchedCountry) => {
    const trimmedCountry = searchedCountry.trim();

    // Check empty input
    if (!trimmedCountry) {
      setError("Please enter a country name.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setData(null);
      setHistoricalData([]);

      // =====================================
      // CURRENT COUNTRY DATA
      // =====================================

      const response = await fetch(
        `${API_URL}/country/${encodeURIComponent(
          trimmedCountry
        )}`
      );

      if (!response.ok) {
        throw new Error("Country not found");
      }

      const result = await response.json();

      // Keep loading animation visible
      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      if (!result.success && !result.data) {
        throw new Error("Invalid country data");
      }

      // Display country data
      setData(result);

      // =====================================
      // SAVE RECENT SEARCH
      // =====================================

      const updatedSearches = [
        trimmedCountry,

        ...recentSearches.filter(
          (item) =>
            item.toLowerCase() !==
            trimmedCountry.toLowerCase()
        ),
      ].slice(0, 5);

      setRecentSearches(updatedSearches);

      localStorage.setItem(
        "recentCountries",
        JSON.stringify(updatedSearches)
      );

      // =====================================
      // HISTORICAL DATA
      // =====================================

      const historicalResponse = await fetch(
        `${API_URL}/historical/${encodeURIComponent(
          trimmedCountry
        )}`
      );

      if (historicalResponse.ok) {
        const historicalResult =
          await historicalResponse.json();

        const history = Array.isArray(
          historicalResult
        )
          ? historicalResult
          : historicalResult.data || [];

        setHistoricalData(
          history.map((item) => ({
            date: item.date,

            cases: Number(
              item.cases ||
                item.totalCases ||
                item.TotalCases ||
                0
            ),

            deaths: Number(
              item.deaths ||
                item.totalDeaths ||
                item.TotalDeaths ||
                0
            ),

            recovered: Number(
              item.recovered ||
                item.totalRecovered ||
                item.TotalRecovered ||
                0
            ),
          }))
        );
      }
    } catch (err) {
      console.error(
        "Country search error:",
        err
      );

      setData(null);
      setHistoricalData([]);

      setError(
        "Country data not found. Please check the country name."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // FORM SEARCH
  // =========================================

  const searchCountry = async (e) => {
    e.preventDefault();

    await fetchCountryData(country);
  };

  // =========================================
  // RECENT SEARCH
  // =========================================

  const searchRecentCountry = async (countryName) => {
    setCountry(countryName);

    await fetchCountryData(countryName);
  };

  // =========================================
  // GET VALUE FROM API
  // =========================================

  const getValue = (keys) => {
    if (!data) return 0;

    // Check direct response
    for (const key of keys) {
      if (
        data[key] !== undefined &&
        data[key] !== null
      ) {
        return data[key];
      }
    }

    // Check nested data object
    if (data.data) {
      for (const key of keys) {
        if (
          data.data[key] !== undefined &&
          data.data[key] !== null
        ) {
          return data.data[key];
        }
      }
    }

    return 0;
  };

  // =========================================
  // FORMAT NUMBER
  // =========================================

  const formatNumber = (number) => {
    return Number(number || 0).toLocaleString(
      "en-IN"
    );
  };

  // =========================================
  // COVID STATISTICS
  // =========================================

  const cases = getValue([
    "totalCases",
    "cases",
    "TotalCases",
  ]);

  const deaths = getValue([
    "totalDeaths",
    "deaths",
    "TotalDeaths",
  ]);

  const recovered = getValue([
    "totalRecovered",
    "recovered",
    "TotalRecovered",
  ]);

  const active =
    Number(
      getValue([
        "activeCases",
        "active",
        "ActiveCases",
      ])
    ) ||
    Math.max(
      Number(cases) -
        Number(deaths) -
        Number(recovered),
      0
    );

  // =========================================
  // COUNTRY NAME
  // =========================================

  const displayCountry =
    data?.data?.country ||
    data?.country ||
    country;

  // =========================================
  // RETURN
  // =========================================

  return (
    <div className="country-page">

      {/* =====================================
          HERO SECTION
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
          SEARCH SECTION
      ====================================== */}

      <section className="country-search-section">

        <h2>
          Search Country
        </h2>

        <p>
          Enter a country name to view
          COVID-19 statistics.
        </p>

        <form
          className="country-search-form"
          onSubmit={searchCountry}
        >

          <input
            type="text"
            placeholder="Enter country name, e.g. India"
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
          />

          <select
  value={country}
  onChange={(e) =>
    setCountry(e.target.value)
  }
  disabled={countriesLoading || loading}
  className="country-dropdown"
>
  <option value="">
    {countriesLoading
      ? "Loading countries..."
      : "Select a country"}
  </option>

  {countries.map((countryName) => (
    <option
      key={countryName}
      value={countryName}
    >
      {countryName}
    </option>
  ))}
</select>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Searching..."
              : "Search"}
          </button>

        </form>


        {/* =================================
            ERROR
        ================================== */}

        {error && (
          <div className="country-error">
            ⚠️ {error}
          </div>
        )}


        {/* =================================
            LOADING
        ================================== */}

        {loading && (
          <div className="country-loading">

            <div className="loading-spinner"></div>

            Loading COVID-19 data...

          </div>
        )}


        {/* =================================
            RECENT SEARCHES
        ================================== */}

        {recentSearches.length > 0 && (

          <div className="recent-searches">

            <h3>
              🕘 Recent Searches
            </h3>

            <div className="recent-search-list">

              {recentSearches.map(
                (item, index) => (

                  <button
                    key={index}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      searchRecentCountry(item);
                    }}
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

          {/* =================================
              RESULT HEADER
          ================================== */}

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


          {/* =================================
              STATISTICS CARDS
          ================================== */}

          <div className="country-stats-grid">

            {/* TOTAL CASES */}

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


            {/* TOTAL DEATHS */}

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


            {/* RECOVERED */}

            <div className="country-card recovered">

              <div className="country-card-icon">
                ✓
              </div>

              <p>
                Recovered
              </p>

              <h3>
                {Number(recovered) > 0
                  ? formatNumber(recovered)
                  : "Data unavailable"}
              </h3>

            </div>


            {/* ACTIVE CASES */}

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


          {/* =========================================
              HISTORICAL COVID-19 CHART
          ========================================= */}

          <div className="historical-chart">

            {/* CHART HEADER */}

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


            {/* CHART */}

            {historicalData.length > 0 ? (

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={historicalData}
                    margin={{
                      top: 15,
                      right: 25,
                      left: 10,
                      bottom: 70,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="date"
                      angle={-30}
                      textAnchor="end"
                      height={70}
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


                    {/* CASES */}

                    <Line
                      type="monotone"
                      dataKey="cases"
                      name="Cases"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />


                    {/* DEATHS */}

                    <Line
                      type="monotone"
                      dataKey="deaths"
                      name="Deaths"
                      stroke="#dc2626"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />


                    {/* RECOVERED */}

                    <Line
                      type="monotone"
                      dataKey="recovered"
                      name="Recovered"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
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
          INFORMATION SECTION
      ====================================== */}

      <section className="country-info">

        {/* HOW TO USE */}

        <div>

          <span>
            📌
          </span>

          <div>

            <h3>
              How to use
            </h3>

            <p>
              Enter the name of any supported
              country in the search box and click
              Search to view its COVID-19
              statistics.
            </p>

          </div>

        </div>


        {/* AVAILABLE STATISTICS */}

        <div>

          <span>
            📊
          </span>

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

      </section>

    </div>
  );
}

export default Country;