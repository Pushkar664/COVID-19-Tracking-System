import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <div className="about-hero-content">
            <div className="about-icon">🦠</div>

            <h1>About COVID-19 Tracker</h1>

            <p>
              A modern web application that provides COVID-19 statistics,
              country-wise information, and historical trends in an easy-to-use
              dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* About Project */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-card">
            <div className="section-icon">📊</div>

            <div>
              <h2>About the Project</h2>

              <p>
                COVID-19 Tracker is a MERN Stack based web application designed
                to provide users with useful information about the COVID-19
                pandemic.
              </p>

              <p>
                The application collects COVID-19 statistics from external
                data sources and presents them through a simple and
                user-friendly interface. Users can view worldwide statistics,
                search for individual countries, and analyze historical
                COVID-19 trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="about-section about-section-alt">
        <div className="about-container">

          <div className="section-heading">
            <span>🎯</span>
            <div>
              <h2>Project Objectives</h2>
              <p>What this application aims to provide</p>
            </div>
          </div>

          <div className="objective-grid">

            <div className="objective-card">
              <div className="objective-icon">🌍</div>
              <h3>Global Statistics</h3>
              <p>
                Display worldwide COVID-19 cases, deaths, recovered cases and
                active cases.
              </p>
            </div>

            <div className="objective-card">
              <div className="objective-icon">🔎</div>
              <h3>Country Search</h3>
              <p>
                Allow users to search and view COVID-19 statistics for
                individual countries.
              </p>
            </div>

            <div className="objective-card">
              <div className="objective-icon">📈</div>
              <h3>Historical Trends</h3>
              <p>
                Present historical COVID-19 information using interactive
                charts.
              </p>
            </div>

            <div className="objective-card">
              <div className="objective-icon">💻</div>
              <h3>User-Friendly Interface</h3>
              <p>
                Provide a clean, responsive and easy-to-use interface for
                accessing COVID-19 information.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section className="about-section">
        <div className="about-container">

          <div className="section-heading">
            <span>✨</span>
            <div>
              <h2>Key Features</h2>
              <p>Important features available in the tracker</p>
            </div>
          </div>

          <div className="features-list">

            <div className="feature-item">
              <span>✓</span>
              <div>
                <h3>Global COVID-19 Dashboard</h3>
                <p>
                  View worldwide COVID-19 statistics in one place.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <div>
                <h3>Country-wise Statistics</h3>
                <p>
                  Search for a country and view its latest available
                  statistics.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <div>
                <h3>Historical Data Visualization</h3>
                <p>
                  Analyze COVID-19 trends using graphical representations.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <div>
                <h3>Dark Mode</h3>
                <p>
                  Switch between light and dark themes for a comfortable
                  viewing experience.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <div>
                <h3>Responsive Design</h3>
                <p>
                  Access the application comfortably on desktop, tablet and
                  mobile devices.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="about-section about-section-alt">
        <div className="about-container">

          <div className="section-heading">
            <span>⚙️</span>
            <div>
              <h2>Technologies Used</h2>
              <p>Technology stack used to develop this project</p>
            </div>
          </div>

          <div className="technology-grid">

            <div className="technology-card">
              <div className="technology-icon">⚛️</div>
              <h3>React.js</h3>
              <p>Frontend user interface</p>
            </div>

            <div className="technology-card">
              <div className="technology-icon">🟢</div>
              <h3>Node.js</h3>
              <p>Backend runtime environment</p>
            </div>

            <div className="technology-card">
              <div className="technology-icon">🚂</div>
              <h3>Express.js</h3>
              <p>Backend API framework</p>
            </div>

            <div className="technology-card">
              <div className="technology-icon">🍃</div>
              <h3>MongoDB</h3>
              <p>Database management</p>
            </div>

            <div className="technology-card">
              <div className="technology-icon">📡</div>
              <h3>REST API</h3>
              <p>COVID-19 data communication</p>
            </div>

            <div className="technology-card">
              <div className="technology-icon">📊</div>
              <h3>Recharts</h3>
              <p>Data visualization</p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="about-section">
        <div className="about-container">

          <div className="section-heading">
            <span>🔄</span>
            <div>
              <h2>How It Works</h2>
              <p>Basic working process of the application</p>
            </div>
          </div>

          <div className="working-grid">

            <div className="working-card">
              <div className="working-number">1</div>
              <h3>Fetch Data</h3>
              <p>
                The backend communicates with COVID-19 data sources to obtain
                the latest available information.
              </p>
            </div>

            <div className="working-card">
              <div className="working-number">2</div>
              <h3>Process Data</h3>
              <p>
                Node.js and Express.js process the received data and provide
                it through REST API endpoints.
              </p>
            </div>

            <div className="working-card">
              <div className="working-number">3</div>
              <h3>Display Data</h3>
              <p>
                React.js retrieves the information and displays it using
                cards, tables and charts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Project Information */}
      <section className="about-section about-section-alt">
        <div className="about-container">

          <div className="project-info-card">

            <div className="project-info-icon">🎓</div>

            <h2>Academic Mini Project</h2>

            <p>
              This project is developed as a Mini Project for MSc Computer
              Science. It demonstrates the practical implementation of
              full-stack web development, REST APIs, database integration and
              data visualization.
            </p>

            <div className="project-tags">
              <span>MERN Stack</span>
              <span>React.js</span>
              <span>Node.js</span>
              <span>MongoDB</span>
              <span>REST API</span>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="about-container">
          <p>
            🦠 COVID-19 Tracker
          </p>
          <span>
            MERN Stack Mini Project
          </span>
        </div>
      </footer>

    </div>
  );
}

export default About;