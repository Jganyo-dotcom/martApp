import React, { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Dashboard.css";

// 1. Define the Master Inventory outside the component
const INVENTORY = [
  { id: 1, name: "Heavy Duty Hammer", price: 25 },
  { id: 2, name: "Precision Screwdriver Set", price: 15 },
  { id: 3, name: "Power Drill 20V", price: 120 },
  { id: 4, name: "Box of Steel Nails (100pc)", price: 10 },
  { id: 5, name: "Measuring Tape 5m", price: 8 },
  { id: 6, name: "Safety Goggles", price: 12 },
  { id: 7, name: "Adjustable Wrench", price: 18 },
  { id: 8, name: "LED Work Light", price: 35 },
  { id: 9, name: "Hard Hat - Yellow", price: 22 },
  { id: 10, name: "Wood Saw", price: 30 },
];

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);

  // 2. Compute results in real-time.
  // If search is empty, it returns everything.
  const filteredResults = useMemo(() => {
    return INVENTORY.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const addToCart = (item) => {
    const existingItem = cart.find((c) => c.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)),
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (id, qty) => {
    setCart(
      cart.map((c) => (c.id === id ? { ...c, qty: Math.max(1, qty) } : c)),
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-content">
        <div className="search-section">
          <div className="search-header">
            <h2>Inventory Management</h2>
            <input
              type="text"
              placeholder="Start typing to filter items..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="results-grid">
            {filteredResults.length > 0 ? (
              filteredResults.map((item) => (
                <div key={item.id} className="result-card glass">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="price-tag">GHC{item.price}</p>
                  </div>
                  <button className="add-btn" onClick={() => addToCart(item)}>
                    Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <p className="no-results">
                No hardware found matching "{searchTerm}"
              </p>
            )}
          </div>
        </div>

        <div className="cart-section glass">
          <h3>Shopping Cart</h3>
          <div className="cart-list">
            {cart.length === 0 && <p className="empty-msg">No items in cart</p>}
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-details">
                  <span className="item-name">{item.name}</span>
                  <div className="qty-controls">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        updateQty(item.id, parseInt(e.target.value))
                      }
                    />
                    <span className="subtotal">GHC{item.price * item.qty}</span>
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total Amount:</span>
              <strong>GHC{total.toFixed(2)}</strong>
            </div>
            {cart.length > 0 && (
              <button
                className="purchase-btn"
                onClick={() => setShowReceipt(true)}
              >
                Generate Receipt
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="modal-overlay">
          <div className="receipt-modal">
            <h2>*** Elitech Mart ***</h2>
            <p className="receipt-date">Date: {new Date().toLocaleString()}</p>
            <div className="divider">------------------------------------</div>

            <ul className="receipt-items">
              {cart.map((item) => (
                <li key={item.id}>
                  {item.name} x {item.qty}
                  <span className="price">GHC{item.price * item.qty}</span>
                </li>
              ))}
            </ul>

            <div className="divider">------------------------------------</div>
            <p className="receipt-total">TOTAL: GHC{total}</p>
            <div className="divider">------------------------------------</div>

            <p className="thanks">THANK YOU FOR CHOOSING ELITECH</p>

            <div className="modal-actions">
              <button className="btn print-btn" onClick={() => window.print()}>
                🖨 Print
              </button>
              <button
                className="btn close-btn"
                onClick={() => setShowReceipt(false)}
              >
                ✖ Close
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
