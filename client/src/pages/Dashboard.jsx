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

  const [globalData, setGlobalData] = useState(null);
  const [topCountries, setTopCountries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [chartData, setChartData] = useState([]);

  // =========================================
  // FETCH DATA WHEN PAGE LOADS
  // =========================================

  useEffect(() => {
    fetchGlobalData();
    fetchTopCountries();
  }, []);

  // =========================================
  // FETCH GLOBAL COVID DATA
  // =========================================

  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/global`);

      if (!response.ok) {
        throw new Error("Failed to fetch global COVID data");
      }

      const result = await response.json();

      console.log("Global COVID Data:", result);

      setGlobalData(result);

      // Get values from API response
      const cases = getValue(result, [
        "cases",
        "totalCases",
      ]);

      const deaths = getValue(result, [
        "deaths",
        "totalDeaths",
      ]);

      const recovered = getValue(result, [
        "recovered",
        "totalRecovered",
      ]);

      const active = getValue(result, [
        "active",
        "activeCases",
      ]);

      // Chart data
      setChartData([
        {
          name: "COVID-19",
          Cases: Number(cases) || 0,
          Deaths: Number(deaths) || 0,
          Recovered: Number(recovered) || 0,
          Active: Number(active) || 0,
        },
      ]);
    } catch (err) {
      console.error("Global data error:", err);

      setError(
        "Unable to load global COVID-19 data."
      );
    } finally {
      setLoading(false);
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

      console.log("Top Countries Data:", result);

      if (
        result.success &&
        Array.isArray(result.data)
      ) {
        setTopCountries(result.data);
      } else {
        setTopCountries([]);
      }
    } catch (err) {
      console.error(
        "Top countries error:",
        err
      );

      setTopCountries([]);
    }
  };

  // =========================================
  // GET VALUE FROM API RESPONSE
  // =========================================

  const getValue = (obj, keys) => {
    if (!obj) {
      return 0;
    }

    for (const key of keys) {
      // Example:
      // result.cases
      if (
        obj[key] !== undefined &&
        obj[key] !== null
      ) {
        return obj[key];
      }

      // Example:
      // result.data.cases
      if (
        obj.data &&
        obj.data[key] !== undefined &&
        obj.data[key] !== null
      ) {
        return obj.data[key];
      }
    }

    return 0;
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
      return "0";
    }

    const numericValue = Number(number);

    if (Number.isNaN(numericValue)) {
      return "0";
    }

    return numericValue.toLocaleString("en-IN");
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
            {error}
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

              <h2 className="section-heading">
                Global COVID-19 Statistics
              </h2>


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
                        getValue(
                          globalData,
                          [
                            "cases",
                            "totalCases",
                          ]
                        )
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
                        getValue(
                          globalData,
                          [
                            "deaths",
                            "totalDeaths",
                          ]
                        )
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
                        getValue(
                          globalData,
                          [
                            "recovered",
                            "totalRecovered",
                          ]
                        )
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
                        getValue(
                          globalData,
                          [
                            "active",
                            "activeCases",
                          ]
                        )
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
                    Overview of worldwide
                    COVID-19 statistics
                  </p>

                </div>


                {/* CHART */}

                <div className="chart-container">

                  {chartData.length > 0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <LineChart
                        data={chartData}
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
                          dataKey="name"
                        />

                        <YAxis />

                        <Tooltip />

                        <Legend />


                        {/* CASES */}

                        <Line
                          type="monotone"
                          dataKey="Cases"
                          name="Cases"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />


                        {/* DEATHS */}

                        <Line
                          type="monotone"
                          dataKey="Deaths"
                          name="Deaths"
                          stroke="#dc2626"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />


                        {/* RECOVERED */}

                        <Line
                          type="monotone"
                          dataKey="Recovered"
                          name="Recovered"
                          stroke="#16a34a"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />


                        {/* ACTIVE */}

                        <Line
                          type="monotone"
                          dataKey="Active"
                          name="Active"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  ) : (

                    <p>
                      No chart data available.
                    </p>

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
                       * Supports different backend
                       * response structures.
                       */

                      const countryName =
                        item.country ||
                        item.data?.country ||
                        "Unknown";


                      const countryData =
                        item.data || item;


                      const cases =
                        getValue(
                          countryData,
                          [
                            "cases",
                            "totalCases",
                          ]
                        );


                      const deaths =
                        getValue(
                          countryData,
                          [
                            "deaths",
                            "totalDeaths",
                          ]
                        );


                      const recovered =
                        getValue(
                          countryData,
                          [
                            "recovered",
                            "totalRecovered",
                          ]
                        );


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