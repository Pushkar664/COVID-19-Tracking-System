import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((previousMode) => !previousMode);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          🦠 COVID-19 Tracker
        </Link>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div
          className={`navbar-links ${
            menuOpen ? "mobile-open" : ""
          }`}
        >
          <Link to="/" onClick={closeMenu}>
            Dashboard
          </Link>

          <Link to="/country" onClick={closeMenu}>
            Country
          </Link>

          <Link to="/compare" onClick={closeMenu}>
            Compare
          </Link>

          <Link to="/about" onClick={closeMenu}>
            About
          </Link>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle dark mode"
            title={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;