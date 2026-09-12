import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand">
          <h3>🦠 COVID-19 Tracker</h3>
          <p>
            Track COVID-19 statistics and explore
            country-wise information.
          </p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>

          <Link to="/">Dashboard</Link>
          <Link to="/country">Country</Link>
          <Link to="/about">About</Link>
        </div>

        <div className="footer-source">
          <h4>Data Sources</h4>

          <p>Disease.sh API</p>
          <p>World Health Organization</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} COVID-19 Tracker.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;