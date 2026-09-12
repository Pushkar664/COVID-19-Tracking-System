import { useState } from "react";
import "./Compare.css";

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

const API_URL = "http://192.168.1.11:5000/api/covid";

function Compare() {
  const [countryA, setCountryA] = useState("");
  const [countryB, setCountryB] = useState("");

  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // FETCH COUNTRY
  // =========================================

  const fetchCountry = async (countryName) => {
    const response = await fetch(
      `${API_URL}/country/${encodeURIComponent(
        countryName.trim()
      )}`
    );

    if (!response.ok) {
      throw new Error(
        `${countryName} not found`
      );
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(
        `${countryName} data unavailable`
      );
    }

    return result.data;
  };

  // =========================================
  // COMPARE COUNTRIES
  // =========================================

  const compareCountries = async (e) => {
    e.preventDefault();

    const firstCountry = countryA.trim();
    const secondCountry = countryB.trim();

    if (!firstCountry || !secondCountry) {
      setError(
        "Please enter both country names."
      );
      return;
    }

    if (
      firstCountry.toLowerCase() ===
      secondCountry.toLowerCase()
    ) {
      setError(
        "Please select two different countries."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      setDataA(null);
      setDataB(null);

      const [firstData, secondData] =
        await Promise.all([
          fetchCountry(firstCountry),
          fetchCountry(secondCountry),
        ]);

      setDataA(firstData);
      setDataB(secondData);
    } catch (err) {
      console.error(
        "Country comparison error:",
        err
      );

      setDataA(null);
      setDataB(null);

      setError(
        "Unable to compare countries. Please check the country names."
      );
    } finally {
      setLoading(false);
    }
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
  // GET COUNTRY VALUE
  // =========================================

  const getCountryValue = (
    countryData,
    key
  ) => {
    if (!countryData) return 0;

    return Number(
      countryData[key] || 0
    );
  };

  // =========================================
  // COUNTRY STATISTICS
  // =========================================

  const casesA = getCountryValue(
    dataA,
    "cases"
  );

  const deathsA = getCountryValue(
    dataA,
    "deaths"
  );

  const recoveredA = getCountryValue(
    dataA,
    "recovered"
  );

  const activeA = getCountryValue(
    dataA,
    "active"
  );

  const casesB = getCountryValue(
    dataB,
    "cases"
  );

  const deathsB = getCountryValue(
    dataB,
    "deaths"
  );

  const recoveredB = getCountryValue(
    dataB,
    "recovered"
  );

  const activeB = getCountryValue(
    dataB,
    "active"
  );

  // =========================================
  // CHART DATA
  // =========================================

  const chartData =
    dataA && dataB
      ? [
          {
            name: "Cases",
            [dataA.country]: casesA,
            [dataB.country]: casesB,
          },
          {
            name: "Deaths",
            [dataA.country]: deathsA,
            [dataB.country]: deathsB,
          },
          {
            name: "Recovered",
            [dataA.country]: recoveredA,
            [dataB.country]: recoveredB,
          },
          {
            name: "Active",
            [dataA.country]: activeA,
            [dataB.country]: activeB,
          },
        ]
      : [];

  // =========================================
  // RETURN
  // =========================================

  return (
    <div className="compare-page">

      {/* =====================================
          HERO
      ====================================== */}

      <section className="compare-hero">

        <div>
          <span className="compare-badge">
            COUNTRY COMPARISON
          </span>

          <h1>
            Compare COVID-19 Statistics
          </h1>

          <p>
            Compare COVID-19 statistics between
            two countries.
          </p>
        </div>

        <div className="compare-hero-icon">
          🌍
        </div>

      </section>


      {/* =====================================
          SEARCH SECTION
      ====================================== */}

      <section className="compare-search">

        <h2>
          Select Countries
        </h2>

        <p>
          Enter two country names to compare
          their COVID-19 statistics.
        </p>

        <form
          className="compare-form"
          onSubmit={compareCountries}
        >

          <div className="compare-input-group">

            <label>
              Country 1
            </label>

            <input
              type="text"
              placeholder="e.g. India"
              value={countryA}
              onChange={(e) =>
                setCountryA(e.target.value)
              }
            />

          </div>


          <div className="compare-vs">
            VS
          </div>


          <div className="compare-input-group">

            <label>
              Country 2
            </label>

            <input
              type="text"
              placeholder="e.g. USA"
              value={countryB}
              onChange={(e) =>
                setCountryB(e.target.value)
              }
            />

          </div>


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Comparing..."
              : "Compare Countries"}
          </button>

        </form>


        {/* ERROR */}

        {error && (
          <div className="compare-error">
            ⚠️ {error}
          </div>
        )}


        {/* LOADING */}

        {loading && (
          <div className="compare-loading">

            <div className="compare-spinner"></div>

            Loading country data...

          </div>
        )}

      </section>


      {/* =====================================
          RESULTS
      ====================================== */}

      {dataA && dataB && (

        <section className="comparison-results">

          {/* =================================
              COUNTRY HEADERS
          ================================== */}

          <div className="country-comparison-header">

            <div className="comparison-country">

              <span>
                COUNTRY 1
              </span>

              <h2>
                {dataA.country}
              </h2>

            </div>


            <div className="comparison-vs-large">
              VS
            </div>


            <div className="comparison-country">

              <span>
                COUNTRY 2
              </span>

              <h2>
                {dataB.country}
              </h2>

            </div>

          </div>


          {/* =================================
              STATISTICS
          ================================== */}

          <div className="comparison-grid">

            {/* CASES */}

            <div className="comparison-card">

              <div className="comparison-card-title">
                🧪
                <span>
                  Total Cases
                </span>
              </div>

              <div className="comparison-values">

                <div>
                  <small>
                    {dataA.country}
                  </small>

                  <strong>
                    {formatNumber(casesA)}
                  </strong>
                </div>

                <div>
                  <small>
                    {dataB.country}
                  </small>

                  <strong>
                    {formatNumber(casesB)}
                  </strong>
                </div>

              </div>

            </div>


            {/* DEATHS */}

            <div className="comparison-card">

              <div className="comparison-card-title">
                ⚠️
                <span>
                  Total Deaths
                </span>
              </div>

              <div className="comparison-values">

                <div>
                  <small>
                    {dataA.country}
                  </small>

                  <strong>
                    {formatNumber(deathsA)}
                  </strong>
                </div>

                <div>
                  <small>
                    {dataB.country}
                  </small>

                  <strong>
                    {formatNumber(deathsB)}
                  </strong>
                </div>

              </div>

            </div>


            {/* RECOVERED */}

            <div className="comparison-card">

              <div className="comparison-card-title">
                ✓
                <span>
                  Recovered
                </span>
              </div>

              <div className="comparison-values">

                <div>
                  <small>
                    {dataA.country}
                  </small>

                  <strong>
                    {recoveredA > 0
                      ? formatNumber(
                          recoveredA
                        )
                      : "Unavailable"}
                  </strong>
                </div>

                <div>
                  <small>
                    {dataB.country}
                  </small>

                  <strong>
                    {recoveredB > 0
                      ? formatNumber(
                          recoveredB
                        )
                      : "Unavailable"}
                  </strong>
                </div>

              </div>

            </div>


            {/* ACTIVE */}

            <div className="comparison-card">

              <div className="comparison-card-title">
                📊
                <span>
                  Active Cases
                </span>
              </div>

              <div className="comparison-values">

                <div>
                  <small>
                    {dataA.country}
                  </small>

                  <strong>
                    {formatNumber(activeA)}
                  </strong>
                </div>

                <div>
                  <small>
                    {dataB.country}
                  </small>

                  <strong>
                    {formatNumber(activeB)}
                  </strong>
                </div>

              </div>

            </div>

          </div>


          {/* =================================
              COMPARISON CHART
          ================================== */}

          <div className="comparison-chart">

            <div className="comparison-chart-header">

              <div className="comparison-chart-icon">
                📊
              </div>

              <div>
                <h2>
                  Country Comparison
                </h2>

                <p>
                  COVID-19 statistics comparison
                </p>
              </div>

            </div>


            <div className="comparison-chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 25,
                    left: 10,
                    bottom: 20,
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

                  <Bar
                    dataKey={dataA.country}
                    fill="#2563eb"
                    name={dataA.country}
                  />

                  <Bar
                    dataKey={dataB.country}
                    fill="#dc2626"
                    name={dataB.country}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </section>

      )}


      {/* =====================================
          INFORMATION
      ====================================== */}

      <section className="compare-info">

        <div>

          <span>
            📌
          </span>

          <div>

            <h3>
              How to use
            </h3>

            <p>
              Enter two country names and click
              Compare Countries to view their
              COVID-19 statistics side-by-side.
            </p>

          </div>

        </div>


        <div>

          <span>
            📊
          </span>

          <div>

            <h3>
              Comparison Statistics
            </h3>

            <p>
              Compare total cases, deaths,
              recovered patients and active
              cases between countries.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Compare;