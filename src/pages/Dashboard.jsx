import React, { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { saveSaleToBackend } from "../services/productApi";
import { getAllProducts } from "../services/productApi";
import "../styles/Dashboard.css";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // ─── MULTI-SESSION BASKET CONTROLLER STATES ────────────────
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("elitech_pos_sessions");
    return saved ? JSON.parse(saved) : [{ id: Date.now(), customerName: "", cart: [] }];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return sessions[0]?.id || Date.now();
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pressTimerRef = useRef(null);

  // Sync active queues to localStorage whenever items or names change
  useEffect(() => {
    localStorage.setItem("elitech_pos_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Extract active basket states
  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === currentSessionId) || sessions[0];
  }, [sessions, currentSessionId]);

  const cart = activeSession?.cart || [];
  const customerName = activeSession?.customerName || "";

  // Helper function to update active workspace properties
  const updateActiveSessionData = (updatedFields) => {
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, ...updatedFields } : s));
  };

  // ─── 🌟 NEW: GLOBAL REAL-TIME VIRTUAL STOCK CALCULATOR ───
  // This calculates how many units are truly available for the CURRENT tab,
  // by subtracting what ALL OTHER tabs have already locked up.
  const getVirtualStock = (productId, backendUnitsLeft) => {
    const unitsClaimedByOtherTabs = sessions
      .filter(s => s.id !== currentSessionId) // Exclude current active tab
      .reduce((sum, s) => {
        const itemInOtherCart = s.cart.find(c => c.id === productId);
        return sum + (itemInOtherCart ? itemInOtherCart.qty : 0);
      }, 0);

    return Math.max(0, backendUnitsLeft - unitsClaimedByOtherTabs);
  };

  // ─── ADD / SWITCH / TERMINATE BASKET QUEUES ────────────────
  const createNewSession = () => {
    const newId = Date.now();
    const newTabNumber = sessions.length + 1;
    const newSession = {
      id: newId,
      customerName: `Customer Queue #${newTabNumber}`,
      cart: []
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newId);
  };

  const closeSession = (idToClose, e) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      setSessions([{ id: Date.now(), customerName: "", cart: [] }]);
      setCurrentSessionId(Date.now());
      return;
    }
    const remaining = sessions.filter(s => s.id !== idToClose);
    setSessions(remaining);
    if (currentSessionId === idToClose) {
      setCurrentSessionId(remaining[0].id);
    }
  };

  // Fetch products from DB
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getAllProducts();
        if (data && data.products) {
          setProducts(data.products);
        } else {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load products:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredResults = useMemo(() => {
    return products.filter((item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, products]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage) || 1;

  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResults, currentPage]);

  // ─── CART ACTIONS INCORPORATING VIRTUAL GUARDS ───────────
  const addToCart = (item) => {
    const virtualUnitsLeft = getVirtualStock(item.id, item.unitsLeft);
    const existingItem = cart.find((c) => c.id === item.id);
    let updatedCart = [];

    if (existingItem) {
      // Guard: Check current cart quantity against dynamically allowed virtual stock bounds
      if (existingItem.qty >= virtualUnitsLeft) {
        alert(`Stock locked by another open customer tab! Only ${virtualUnitsLeft} remaining units are safely available for this customer.`);
        return;
      }
      updatedCart = cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      if (virtualUnitsLeft <= 0) {
        alert("This item is currently sitting in another customer's pending cart tab and is unavailable.");
        return;
      }
      updatedCart = [...cart, { ...item, qty: 1 }];
    }
    updateActiveSessionData({ cart: updatedCart });
  };

  const updateQty = (id, qty, backendUnitsLeft) => {
    const targetQty = Math.max(1, qty);
    const virtualUnitsLeft = getVirtualStock(id, backendUnitsLeft);

    if (targetQty > virtualUnitsLeft) {
      alert(`Stock Limit Conflict! Other active checkout tabs hold portions of this stock. Max allowed for this customer: ${virtualUnitsLeft} units.`);
      return;
    }
    const updatedCart = cart.map((c) => (c.id === id ? { ...c, qty: targetQty } : c));
    updateActiveSessionData({ cart: updatedCart });
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter((c) => c.id !== id);
    updateActiveSessionData({ cart: updatedCart });
  };

  const clearTransaction = () => {
    updateActiveSessionData({ cart: [], customerName: "" });
    setShowReceipt(false);
    setShowSaveModal(false);
  };

  const total = cart.reduce((sum, c) => sum + c.sellingPricePerUnit * c.qty, 0);
  const mart = localStorage.getItem("mart");
  const user = localStorage.getItem("user");

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

  return (
    <div className="dashboard">
      <Navbar brand={mart} user={user} />

      <div className="session-tabs-bar glass">
        <div className="tabs-container">
          {sessions.map((s, index) => (
            <div 
              key={s.id} 
              className={`session-tab ${s.id === currentSessionId ? "active-tab" : ""}`}
              onClick={() => setCurrentSessionId(s.id)}
            >
              <span className="tab-title">
                {s.customerName.trim() !== "" ? s.customerName : `Queue #${index + 1}`} 
                {s.cart.length > 0 && <span className="tab-badge">({s.cart.length})</span>}
              </span>
              <button className="close-tab-btn" onClick={(e) => closeSession(s.id, e)}>&times;</button>
            </div>
          ))}
        </div>
        <button className="create-session-btn" onClick={createNewSession}>
          ➕ Serve Another Customer
        </button>
      </div>

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
              {isLoading && <span className="search-spinner">Syncing...</span>}
            </div>
          </div>

          <div className="results-grid">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((item) => {
                // Get virtual real-time allowed stock remaining for this item
                const virtualUnitsLeft = getVirtualStock(item.id, item.unitsLeft);
                const isOutOfStock = virtualUnitsLeft <= 0;

                // Find out if current customer already has some in their basket
                const currentCartItem = cart.find(c => c.id === item.id);
                const currentCustomerQty = currentCartItem ? currentCartItem.qty : 0;

                return (
                  <div key={item.id} className={`result-card glass ${isOutOfStock ? "out-of-stock-card" : ""}`}>
                    <div className="item-info">
                      <h4>{item.productName}</h4>
                      <p className="price-tag">GHC{item.sellingPricePerUnit}</p>
                      
                      {/* Show current tab selection status vs aggregate layout limits */}
                      <small style={{ color: isOutOfStock ? "#ff4d4d" : "#00f2fe" }}>
                        {isOutOfStock 
                          ? "Out of Stock (Claimed)" 
                          : `Available to add: ${virtualUnitsLeft - currentCustomerQty}`}
                      </small>
                      {currentCustomerQty > 0 && (
                        <div style={{ fontSize: "0.75rem", color: "#a3b3cc", marginTop: "2px" }}>
                          In this cart: {currentCustomerQty}
                        </div>
                      )}
                    </div>
                    <button 
                      className={`add-btn ${isOutOfStock ? "disabled-btn" : ""}`} 
                      onClick={() => addToCart(item)}
                      disabled={isOutOfStock || currentCustomerQty >= virtualUnitsLeft}
                    >
                      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="no-results">
                {isLoading ? "Fetching fresh stock details..." : `No items found matching "${searchTerm}"`}
              </p>
            )}
          </div>

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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
            <label>Customer Name / Identifier</label>
            <input
              type="text"
              placeholder="Name or Queue ID to distinguish tab..."
              value={customerName}
              onChange={(e) => updateActiveSessionData({ customerName: e.target.value })}
            />
          </div>

          <div className="cart-list">
            {cart.length === 0 && <p className="empty-msg">No items in this cart</p>}
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-details">
                  <span className="item-name">{item.productName}</span>
                  <div className="qty-controls">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1, item.unitsLeft)}
                    />
                    <span className="subtotal">
                      GHC{(item.sellingPricePerUnit * item.qty).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeItem(item.id)}>&times;</button>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total Amount:</span>
              <strong>GHC{total.toFixed(2)}</strong>
            </div>
            {cart.length > 0 && (
              <button className="purchase-btn" onClick={() => setShowReceipt(true)}>
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
            <h2>*** {mart || "Elitech Mart"} ***</h2>
            <p className="receipt-date">Date: {new Date().toLocaleString()}</p>

            {customerName && (
              <p className="receipt-customer" style={{ textAlign: "left", fontSize: "0.9rem", textTransform: "uppercase" }}>
                <strong>Customer:</strong> {customerName}
              </p>
            )}
            <div className="divider">------------------------------------</div>

            <ul className="receipt-items">
              {cart.map((item) => (
                <li key={item.id}>
                  {item.productName} x {item.qty}
                  <span className="price">GHC{(item.sellingPricePerUnit * item.qty).toFixed(2)}</span>
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
              <button className="btn close-btn" onClick={() => setShowReceipt(false)}>✖ Close</button>
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
                          const res = await saveSaleToBackend(cart, customerName);
                          alert(res.message);
                          
                          // After transaction saves successfully, backend numbers drop.
                          // We can safely purge just this current tab out of our states layout
                          const remaining = sessions.filter(s => s.id !== currentSessionId);
                          if (remaining.length === 0) {
                            setSessions([{ id: Date.now(), customerName: "", cart: [] }]);
                            setCurrentSessionId(Date.now());
                          } else {
                            setSessions(remaining);
                            setCurrentSessionId(remaining[0].id);
                          }
                          setShowReceipt(false);
                          setShowSaveModal(false);
                          
                          // Trigger database inventory sync
                          const freshData = await getAllProducts();
                          if (freshData && freshData.products) setProducts(freshData.products);
                        } catch (err) {
                          alert("Error saving transaction: " + err.message);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button className="btn secondary-btn" onClick={() => setShowSaveModal(false)}>Cancel</button>
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
