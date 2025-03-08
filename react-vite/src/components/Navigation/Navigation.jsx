// src/components/Navigation/Navigation.jsx
import { NavLink, useNavigate } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import StockSearchBar from "./StockSearchBar";
import "./Navigation.css";

function Navigation() {
  const navigate = useNavigate();

  return (
    <nav className="navigation-bar">
      {/* Left: Logo (links to home) */}
      <div className="nav-left">
        <NavLink to="/" className="nav-logo">
          <img src="/logo.webp" alt="GetRichQwik Logo" />
        </NavLink>
      </div>

      {/* Middle: Stock Search Bar */}
      <div className="nav-middle">
        <StockSearchBar />
      </div>

      {/* Right: Explore Button and Profile Button */}
      <div className="nav-right">
        <NavLink to="/explore" className="explore-link">
          Explore
        </NavLink>
        <ProfileButton />
      </div>
    </nav>
  );
}

export default Navigation;
