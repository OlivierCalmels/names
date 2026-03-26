import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import ChartsPage from "./ChartsPage";
import "./App.css";
import RecordsPage from "./RecordsPage";

export default function App() {
  return (
    <HashRouter>
      <nav className="app-nav" aria-label="Navigation principale">
        <NavLink
          className={({ isActive }) => `app-nav-link${isActive ? " app-nav-link--active" : ""}`}
          end
          to="/"
        >
          Graphiques
        </NavLink>
        <NavLink
          className={({ isActive }) => `app-nav-link${isActive ? " app-nav-link--active" : ""}`}
          to="/records"
        >
          Records
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<ChartsPage />} />
        <Route path="/records" element={<RecordsPage />} />
      </Routes>
    </HashRouter>
  );
}
