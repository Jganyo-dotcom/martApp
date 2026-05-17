import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar({ brand = "Elitech Mart" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-brand">{brand}</div>

      {/* Desktop Nav */}
      <nav className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/inventory">Inventory</Link>
        {/* <Link to="/stock">Stock</Link> */}
        <Link to="/profit">Profit</Link>
        <Link to="/settings">Settings</Link>
      </nav>

      {/* Mobile Hamburger */}
      <button
        className="hamburger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="sidebar">
          <Link to="/dashboard" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link to="/inventory" onClick={() => setIsOpen(false)}>
            Inventory
          </Link>
          <Link to="/stock" onClick={() => setIsOpen(false)}>
            Stock
          </Link>
          <Link to="/profit" onClick={() => setIsOpen(false)}>
            Profit
          </Link>
          <Link to="/settings" onClick={() => setIsOpen(false)}>
            Settings
          </Link>
        </div>
      )}
    </header>
  );
}
