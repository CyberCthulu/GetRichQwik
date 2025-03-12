// src/components/Navigation/Navigation.jsx
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import StockSearchBar from "./StockSearchBar";
import ExploreMenu from "./ExploreMenu";
import "./Navigation.css";

function Navigation() {
  const sessionUser = useSelector((state) => state.session.user);

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
        {sessionUser && <StockSearchBar />}
      </div>

      {/* Right: Explore Dropdown and Profile Button */}
      <div className="nav-right">
        {sessionUser && <ExploreMenu />}
        <ProfileButton />
      </div>
    </nav>
  );
}

export default Navigation;