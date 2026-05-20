import React, { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { saveSaleToBackend } from "../services/productApi";
import { getAllProducts } from "../services/productApi";
import "../styles/Dashboard.css";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // ─── NEW STATES FOR PAGINATION & LOADING ───────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  const pressTimerRef = useRef(null);

  // Fetch products from DB
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Reset page to 1 whenever search query updates
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter results in real-time
  const filteredResults = useMemo(() => {
    return products.filter((item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, products]);

  // ─── PAGINATION SPLITTING CRITERIA ────────────────────────
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage) || 1;

  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResults, currentPage]);

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

  const clearTransaction = () => {
    setCart([]);
    setCustomerName("");
    setShowReceipt(false);
    setShowSaveModal(false);
  };

  const total = cart.reduce((sum, c) => sum + c.sellingPricePerUnit * c.qty, 0);
  const mart = localStorage.getItem("mart");
  const user = localStorage.getItem("user");

  // CROSS-PLATFORM LONG PRESS HANDLERS
  const startPressTimer = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => {
      setShowSaveModal(true);
    }, 1000);
  };

  const cancelPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    };
  }, []);

  return (
    <div className="dashboard">
      <Navbar brand={mart} user={user} />

      <div className="dashboard-content">
        <div className="search-section">
          <div className="search-header">
            <h2>Inventory Management</h2>
            <div className="search-bar-container">
              <input
                type="text"
                placeholder="Start typing to filter items..."
                className="search-bar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Async/Network Processing Indicator */}
              {isLoading && <span className="search-spinner">Syncing...</span>}
            </div>
          </div>

          <div className="results-grid">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((item) => (
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
                {isLoading
                  ? "Fetching fresh stock details..."
                  : `No hardware found matching "${searchTerm}"`}
              </p>
            )}
          </div>

          {/* ─── MODERN CONTROLLERS FOR PAGINATION ─────────────────── */}
          {filteredResults.length > itemsPerPage && (
            <div className="pagination-controls glass">
              <button
                className="pag-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span className="page-counter">
                Page <strong>{currentPage}</strong> of {totalPages}
              </span>
              <button
                className="pag-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        <div className="cart-section glass">
          <h3>Shopping Cart</h3>

          <div className="customer-info-input">
            <label>Customer Name</label>
            <input
              type="text"
              placeholder="Enter buyer's name (Optional)..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

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
                        updateQty(item.id, parseInt(e.target.value) || 1)
                      }
                    />
                    <span className="subtotal">
                      GHC{(item.sellingPricePerUnit * item.qty).toFixed(2)}
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

            {customerName && (
              <p
                className="receipt-customer"
                style={{
                  textAlign: "left",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                }}
              >
                <strong>Customer:</strong> {customerName}
              </p>
            )}
            <div className="divider">------------------------------------</div>

            <ul className="receipt-items">
              {cart.map((item) => (
                <li key={item.id}>
                  {item.productName} x {item.qty}
                  <span className="price">
                    GHC{(item.sellingPricePerUnit * item.qty).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="divider">------------------------------------</div>
            <p className="receipt-total">TOTAL: GHC{total.toFixed(2)}</p>
            <div className="divider">------------------------------------</div>

            <p className="thanks">THANK YOU FOR CHOOSING ELITECH</p>

            <div className="modal-actions">
              <button
                className="btn print-btn"
                onClick={() => window.print()}
                onMouseDown={startPressTimer}
                onMouseUp={cancelPressTimer}
                onMouseLeave={cancelPressTimer}
                onTouchStart={startPressTimer}
                onTouchEnd={cancelPressTimer}
              >
                🖨 Print
              </button>

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
                          await saveSaleToBackend(cart, customerName);
                          alert("Transaction saved successfully!");
                          clearTransaction();
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
