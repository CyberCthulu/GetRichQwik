import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import "./DropdownMenus.css";

export default function ExploreMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="explore-menu" ref={menuRef}>
      {/* Use the shared .nav-button class here */}
      <button className="nav-button" onClick={toggleMenu}>
        Explore
      </button>
      {isOpen && (
        <div className="explore-dropdown">
          <NavLink to="/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/portfolios" className="dropdown-item" onClick={() => setIsOpen(false)}>
            Portfolios
          </NavLink>
          <NavLink to="/orders" className="dropdown-item" onClick={() => setIsOpen(false)}>
            Orders
          </NavLink>
          <NavLink to="/watchlists" className="dropdown-item" onClick={() => setIsOpen(false)}>
            Watchlists
          </NavLink>
          <NavLink to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
            Profile
          </NavLink>
        </div>
      )}
    </div>
  );
}
