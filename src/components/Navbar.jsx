import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar({ brand = "Elitech Mart", user = "unknown" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="navbar">
      {/* Grouped brand and user together inside a left-side container */}
      <div className="navbar-brand-container">
        <div className="navbar-brand">🏪 {brand}</div>
        <div className="navbar-user">👤 User: {user}</div>
      </div>

      {/* Desktop Nav */}
      <nav className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/inventory">Inventory</Link>
        {/* <Link to="/stock">Stock</Link> */}
        <Link to="/profit">Profit</Link>
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
          {/* Subtle user indicator inside mobile menu too */}
          <div className="sidebar-user-heading">👤 {user}</div>
          <Link to="/dashboard" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link to="/inventory" onClick={() => setIsOpen(false)}>
            Inventory
          </Link>
          <Link to="/profit" onClick={() => setIsOpen(false)}>
            Profit
          </Link>
        </div>
      )}
    </header>
  );
}
