import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

import "./Dashboard.css";

const API_URL = "http://192.168.1.11:5000/api/covid";

function Dashboard() {
  const navigate = useNavigate();

  // =========================================
  // STATE
  // =========================================

  const [globalData, setGlobalData] = useState(null);
  const [topCountries, setTopCountries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [historyData, setHistoryData] = useState([]);

  const [lastUpdated, setLastUpdated] = useState(null);

  // =========================================
  // FETCH DATA WHEN PAGE LOADS
  // =========================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =========================================
  // FETCH ALL DASHBOARD DATA
  // =========================================

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        fetchGlobalData(),
        fetchTopCountries(),
        fetchGlobalHistory(),
      ]);

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // FETCH GLOBAL COVID DATA
  // =========================================

  const fetchGlobalData = async () => {
    try {
      const response = await fetch(
        `${API_URL}/global`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch global COVID data"
        );
      }

      const result = await response.json();

      console.log(
        "Global COVID Data:",
        result
      );

      /*
       * Supports:
       *
       * {
       *   success: true,
       *   data: {...}
       * }
       *
       * and:
       *
       * {
       *   cases: ...,
       *   deaths: ...
       * }
       */

      const data =
        result?.data &&
        typeof result.data === "object"
          ? result.data
          : result;

      setGlobalData(data);

    } catch (err) {
      console.error(
        "Global data error:",
        err
      );

      throw err;
    }
  };

  // =========================================
  // FETCH GLOBAL HISTORICAL DATA
  // =========================================

  const fetchGlobalHistory = async () => {
    try {
      const response = await fetch(
        `${API_URL}/historical-global`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch global historical data"
        );
      }

      const result = await response.json();

      console.log(
        "Global Historical Data:",
        result
      );

      const history =
        result?.success &&
        Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

      setHistoryData(history);

    } catch (err) {
      console.error(
        "Global historical data error:",
        err
      );

      /*
       * Historical chart should not
       * stop the complete dashboard.
       */

      setHistoryData([]);
    }
  };

  // =========================================
  // FETCH TOP 10 COUNTRIES
  // =========================================

  const fetchTopCountries = async () => {
    try {
      const response = await fetch(
        `${API_URL}/top-countries?limit=10`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch top countries"
        );
      }

      const result = await response.json();

      console.log(
        "Top Countries Data:",
        result
      );

      if (
        result?.success &&
        Array.isArray(result.data)
      ) {
        setTopCountries(result.data);
      } else if (Array.isArray(result)) {
        setTopCountries(result);
      } else {
        setTopCountries([]);
      }

    } catch (err) {
      console.error(
        "Top countries error:",
        err
      );

      /*
       * Do not stop the whole dashboard
       * if only the top-country API fails.
       */

      setTopCountries([]);
    }
  };

  // =========================================
  // GET VALUE FROM API RESPONSE
  // =========================================

  const getValue = (obj, keys) => {
    if (!obj) {
      return null;
    }

    // =====================================
    // DIRECT OBJECT
    // =====================================

    for (const key of keys) {
      if (
        obj[key] !== undefined &&
        obj[key] !== null &&
        obj[key] !== ""
      ) {
        const value = Number(obj[key]);

        if (!Number.isNaN(value)) {
          return value;
        }
      }
    }

    // =====================================
    // NESTED DATA OBJECT
    // =====================================

    if (
      obj.data &&
      typeof obj.data === "object"
    ) {
      for (const key of keys) {
        if (
          obj.data[key] !== undefined &&
          obj.data[key] !== null &&
          obj.data[key] !== ""
        ) {
          const value = Number(
            obj.data[key]
          );

          if (!Number.isNaN(value)) {
            return value;
          }
        }
      }
    }

    return null;
  };

  // =========================================
  // FORMAT NUMBERS
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

    return numericValue.toLocaleString(
      "en-IN"
    );
  };

  // =========================================
  // OPEN COUNTRY PAGE
  // =========================================

  const openCountry = (countryName) => {
    if (!countryName) {
      return;
    }

    navigate(
      `/country?name=${encodeURIComponent(
        countryName
      )}`
    );
  };

  // =========================================
  // GLOBAL STATISTICS
  // =========================================

  const globalCases = getValue(
    globalData,
    [
      "cases",
      "totalCases",
      "TotalCases",
      "confirmed",
      "Confirmed",
    ]
  );

  const globalDeaths = getValue(
    globalData,
    [
      "deaths",
      "totalDeaths",
      "TotalDeaths",
      "Deaths",
    ]
  );

  const globalRecoveredFromAPI =
    getValue(
      globalData,
      [
        "recovered",
        "totalRecovered",
        "TotalRecovered",
        "Recovered",
      ]
    );

  const globalActiveFromAPI =
    getValue(
      globalData,
      [
        "active",
        "activeCases",
        "ActiveCases",
        "Active",
      ]
    );

  // =========================================
  // GLOBAL RECOVERED CALCULATION
  // =========================================

  const globalRecovered =
    globalRecoveredFromAPI !== null &&
    globalRecoveredFromAPI > 0
      ? globalRecoveredFromAPI
      : globalCases !== null &&
        globalDeaths !== null &&
        globalActiveFromAPI !== null
      ? Math.max(
          globalCases -
            globalDeaths -
            globalActiveFromAPI,
          0
        )
      : globalRecoveredFromAPI;

  // =========================================
  // GLOBAL ACTIVE CALCULATION
  // =========================================

  const globalActive =
    globalActiveFromAPI !== null &&
    globalActiveFromAPI >= 0
      ? globalActiveFromAPI
      : globalCases !== null &&
        globalDeaths !== null &&
        globalRecovered !== null
      ? Math.max(
          globalCases -
            globalDeaths -
            globalRecovered,
          0
        )
      : null;

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="dashboard">

      {/* =====================================
          HERO SECTION
      ====================================== */}

      <section className="dashboard-hero">

        <div className="dashboard-container">

          <h1>
            COVID-19 Global Tracker
          </h1>

          <p>
            Track the latest COVID-19 statistics
            and explore country-wise information.
          </p>

        </div>

      </section>

      {/* =====================================
          ERROR MESSAGE
      ====================================== */}

      {error && (
        <div className="dashboard-container">

          <div className="dashboard-error">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={fetchDashboardData}
            >
              Retry
            </button>

          </div>

        </div>
      )}

      {/* =====================================
          LOADING
      ====================================== */}

      {loading ? (

        <div className="dashboard-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading global COVID-19 data...
          </p>

        </div>

      ) : (

        <>

          {/* =================================
              GLOBAL STATISTICS
          ================================== */}

          <section className="global-statistics">

            <div className="dashboard-container">

              {/* SECTION HEADER */}

              <div className="dashboard-section-header">

                <div>

                  <h2 className="section-heading">
                    Global COVID-19 Statistics
                  </h2>

                  {lastUpdated && (
                    <p className="last-updated">
                      🕒 Last updated:{" "}
                      {lastUpdated.toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }
                      )}
                    </p>
                  )}

                </div>

                <button
                  type="button"
                  className="refresh-dashboard-btn"
                  onClick={fetchDashboardData}
                  disabled={loading}
                >
                  {loading
                    ? "⟳ Refreshing..."
                    : "↻ Refresh Data"}
                </button>

              </div>

              {/* STATISTICS CARDS */}

              <div className="stats-grid">

                {/* TOTAL CASES */}

                <div className="stat-card cases">

                  <div className="stat-icon">
                    🦠
                  </div>

                  <div>

                    <h3>
                      Total Cases
                    </h3>

                    <p>
                      {formatNumber(
                        globalCases
                      )}
                    </p>

                  </div>

                </div>

                {/* TOTAL DEATHS */}

                <div className="stat-card deaths">

                  <div className="stat-icon">
                    ⚠️
                  </div>

                  <div>

                    <h3>
                      Total Deaths
                    </h3>

                    <p>
                      {formatNumber(
                        globalDeaths
                      )}
                    </p>

                  </div>

                </div>

                {/* RECOVERED */}

                <div className="stat-card recovered">

                  <div className="stat-icon">
                    ❤️
                  </div>

                  <div>

                    <h3>
                      Recovered
                    </h3>

                    <p>
                      {formatNumber(
                        globalRecovered
                      )}
                    </p>

                  </div>

                </div>

                {/* ACTIVE CASES */}

                <div className="stat-card active">

                  <div className="stat-icon">
                    📊
                  </div>

                  <div>

                    <h3>
                      Active Cases
                    </h3>

                    <p>
                      {formatNumber(
                        globalActive
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================
              GLOBAL COVID-19 OVERVIEW
          ================================== */}

          <section className="global-chart-section">

            <div className="dashboard-container">

              <div className="chart-card">

                {/* CHART HEADER */}

                <div className="chart-header">

                  <h2>
                    Global COVID-19 Overview
                  </h2>

                  <p>
                    Worldwide COVID-19 cases and
                    deaths over time
                  </p>

                </div>

                {/* HISTORICAL CHART */}

                <div className="chart-container">

                  {historyData.length > 0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <LineChart
                        data={historyData}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 10,
                          bottom: 10,
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) =>
                            value.slice(0, 7)
                          }
                        />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        {/* CASES */}

                        <Line
                          type="monotone"
                          dataKey="cases"
                          name="Cases"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
                        />

                        {/* DEATHS */}

                        <Line
                          type="monotone"
                          dataKey="deaths"
                          name="Deaths"
                          stroke="#dc2626"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  ) : (

                    <div className="no-countries">

                      <span>
                        📊
                      </span>

                      <p>
                        Historical data is currently
                        unavailable.
                      </p>

                    </div>

                  )}

                </div>

              </div>

            </div>

          </section>

          {/* =================================
              TOP 10 COUNTRIES
          ================================== */}

          <section className="top-countries">

            <div className="dashboard-container">

              {/* SECTION HEADER */}

              <div className="top-countries-header">

                <div>

                  <h2 className="section-heading">
                    Top 10 Countries
                  </h2>

                  <p className="section-description">
                    Countries with the highest
                    reported number of COVID-19
                    cases.
                  </p>

                </div>

                <div className="ranking-badge">
                  🌍 Global Ranking
                </div>

              </div>

              {/* COUNTRY TABLE */}

              <div className="countries-table">

                {/* TABLE HEADER */}

                <div className="table-header">

                  <div>
                    Rank
                  </div>

                  <div>
                    Country
                  </div>

                  <div>
                    Cases
                  </div>

                  <div>
                    Deaths
                  </div>

                  <div>
                    Recovered
                  </div>

                  <div>
                    Action
                  </div>

                </div>

                {/* COUNTRY DATA */}

                {topCountries.length > 0 ? (

                  topCountries.map(
                    (item, index) => {

                      /*
                       * Supports:
                       *
                       * item.country
                       * item.data.country
                       */

                      const countryData =
                        item?.data &&
                        typeof item.data ===
                          "object"
                          ? item.data
                          : item;

                      const countryName =
                        item?.country ||
                        item?.name ||
                        countryData?.country ||
                        countryData?.name ||
                        "Unknown";

                      // =================================
                      // CASES
                      // =================================

                      const cases =
                        getValue(
                          countryData,
                          [
                            "cases",
                            "totalCases",
                            "TotalCases",
                            "confirmed",
                            "Confirmed",
                          ]
                        );

                      // =================================
                      // DEATHS
                      // =================================

                      const deaths =
                        getValue(
                          countryData,
                          [
                            "deaths",
                            "totalDeaths",
                            "TotalDeaths",
                            "Deaths",
                          ]
                        );

                      // =================================
                      // RECOVERED FROM API
                      // =================================

                      const recoveredFromAPI =
                        getValue(
                          countryData,
                          [
                            "recovered",
                            "totalRecovered",
                            "TotalRecovered",
                            "Recovered",
                          ]
                        );

                      // =================================
                      // ACTIVE FROM API
                      // =================================

                      const activeFromAPI =
                        getValue(
                          countryData,
                          [
                            "active",
                            "activeCases",
                            "ActiveCases",
                            "Active",
                          ]
                        );

                      // =================================
                      // CALCULATE RECOVERED
                      // =================================

                      const recovered =
                        recoveredFromAPI !== null &&
                        recoveredFromAPI > 0
                          ? recoveredFromAPI
                          : cases !== null &&
                            deaths !== null &&
                            activeFromAPI !== null
                          ? Math.max(
                              cases -
                                deaths -
                                activeFromAPI,
                              0
                            )
                          : recoveredFromAPI;

                      return (

                        <div
                          className="country-row"
                          key={
                            countryName +
                            index
                          }
                        >

                          {/* RANK */}

                          <div className="country-rank">

                            {index === 0
                              ? "🥇"
                              : index === 1
                              ? "🥈"
                              : index === 2
                              ? "🥉"
                              : `#${index + 1}`}

                          </div>

                          {/* COUNTRY */}

                          <div className="country-name">

                            <span className="country-globe">
                              🌍
                            </span>

                            <span>
                              {countryName}
                            </span>

                          </div>

                          {/* CASES */}

                          <div className="cases-value">

                            {formatNumber(
                              cases
                            )}

                          </div>

                          {/* DEATHS */}

                          <div className="deaths-value">

                            {formatNumber(
                              deaths
                            )}

                          </div>

                          {/* RECOVERED */}

                          <div className="recovered-value">

                            {formatNumber(
                              recovered
                            )}

                          </div>

                          {/* ACTION */}

                          <div>

                            <button
                              className="view-country-btn"
                              type="button"
                              onClick={() =>
                                openCountry(
                                  countryName
                                )
                              }
                            >
                              View →
                            </button>

                          </div>

                        </div>

                      );
                    }
                  )

                ) : (

                  <div className="no-countries">

                    <span>
                      🌍
                    </span>

                    <p>
                      Country data is currently
                      unavailable.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </section>

        </>

      )}

    </div>
  );
}

export default Dashboard;