import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Country from "./pages/Country";
import Compare from "./pages/Compare";
import About from "./pages/About";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      {/* Navigation Bar */}
      <Navbar />

      {/* Application Routes */}
      <Routes>

        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* Country Statistics */}
        <Route
          path="/country"
          element={<Country />}
        />

        <Route
         path="/compare" 
         element={<Compare />} 
         />

        {/* About Project */}
        <Route
          path="/about"
          element={<About />}
        />

      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;