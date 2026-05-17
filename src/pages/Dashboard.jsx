import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { saveSaleToBackend } from "../services/productApi";
import { getAllProducts } from "../services/productApi";
import "../styles/Dashboard.css";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]); // ✅ fetched products
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // ✅ Fetch products from DB once
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err.message);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Filter results in real-time
  const filteredResults = useMemo(() => {
    return products.filter((item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, products]);

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

  const total = cart.reduce((sum, c) => sum + c.sellingPricePerUnit * c.qty, 0);
  const mart = localStorage.getItem("mart");

  return (
    <div className="dashboard">
      <Navbar brand={mart} />

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
                    <h4>{item.productName}</h4>
                    <p className="price-tag">GHC{item.sellingPricePerUnit}</p>
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
                  <span className="item-name">{item.productName}</span>
                  <div className="qty-controls">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        updateQty(item.id, parseInt(e.target.value))
                      }
                    />
                    <span className="subtotal">
                      GHC{item.sellingPricePerUnit * item.qty}
                    </span>
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
                  {item.productName} x {item.qty}
                  <span className="price">
                    GHC{item.sellingPricePerUnit * item.qty}
                  </span>
                </li>
              ))}
            </ul>

            <div className="divider">------------------------------------</div>
            <p className="receipt-total">TOTAL: GHC{total}</p>
            <div className="divider">------------------------------------</div>

            <p className="thanks">THANK YOU FOR CHOOSING ELITECH</p>

            <div className="modal-actions">
              {/* Short click → Print */}
              <button
                className="btn print-btn"
                onClick={() => window.print()}
                onMouseDown={() => {
                  // open save modal after 1s press
                  const timer = setTimeout(() => setShowSaveModal(true), 1000);
                  // cancel if released early
                  const cancel = () => clearTimeout(timer);
                  document.addEventListener("mouseup", cancel, { once: true });
                }}
              >
                🖨 Print
              </button>

              {/* Close receipt modal */}
              <button
                className="btn close-btn"
                onClick={() => setShowReceipt(false)}
              >
                ✖ Close
              </button>
            </div>

            {/* Save Transaction Modal */}
            {showSaveModal && (
              <div className="modal-overlay">
                <div className="save-modal glass">
                  <h2>Save Transaction</h2>
                  <p>Do you want to record this sale in the system?</p>
                  <div className="modal-actions">
                    <button
                      className="btn primary-btn"
                      onClick={async () => {
                        try {
                          await saveSaleToBackend(cart); // 🔑 call service
                          alert("Transaction saved successfully!");
                          setShowSaveModal(false);
                        } catch (err) {
                          alert("Error saving transaction: " + err.message);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="btn secondary-btn"
                      onClick={() => setShowSaveModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
