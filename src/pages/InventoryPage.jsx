import React, { useState, useMemo, useEffect } from "react";
import {
  getAllProducts,
  addProduct,
  handleDelete,
  getProductById, // New api call import
  handleAdd, // The stock update function
} from "../services/productApi";
import Navbar from "../components/Navbar";
import "../styles/Inventory.css";
import Footer from "../components/Footer";

export default function InventoryPage() {
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setshowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Separate, clean state tracking for the single restock model data structure
  const [restockProduct, setRestockProduct] = useState(null);
  const [updateStockProduct, setupdateStockProduct] = useState(null);
  const [editablePacksCount, setEditablePacksCount] = useState("");

  const [form, setForm] = useState({
    productName: "",
    boxesCount: 1,
    quantityPerBox: 1,
    costPricePerBox: 1,
    sellingPricePerUnit: 1,
  });

  const triggerNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 5000);
  };

  // Fetch initial products array for page grid mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getAllProducts();
        const productsList = Array.isArray(data)
          ? data
          : data.product || data.products || [];

        setInventory(productsList);
      } catch (err) {
        console.error("Failed to load products:", err.message);
        triggerNotification("Failed to fetch products.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const mart = localStorage.getItem("mart");
  const user = localStorage.getItem("user");

  // Calculations for creating completely new unique inventory lines
  const calculations = useMemo(() => {
    const boxes = typeof form.boxesCount === "number" ? form.boxesCount : 1;
    const qtyPerBox =
      typeof form.quantityPerBox === "number" ? form.quantityPerBox : 1;
    const costBox =
      typeof form.costPricePerBox === "number" ? form.costPricePerBox : 0;
    const sellUnit =
      typeof form.sellingPricePerUnit === "number"
        ? form.sellingPricePerUnit
        : 0;

    const totalItems = boxes * qtyPerBox;
    const costPerSingle = qtyPerBox > 0 ? costBox / qtyPerBox : 0;

    const singleProfit = sellUnit - costPerSingle;
    const totalProfit = sellUnit * totalItems - costBox * boxes;

    return {
      singleProfit: singleProfit > 0 ? singleProfit.toFixed(2) : "0.00",
      totalProfit: totalProfit > 0 ? totalProfit.toFixed(2) : "0.00",
    };
  }, [form]);

  // Action: Add Completely New Entry
  const handleAddGood = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      const res = await addProduct(payload);
      const targetProduct =
        res?.product?.[0] || res?.product || res?.data || res;

      setInventory([targetProduct, ...inventory]);
      setShowModal(false);
      triggerNotification(
        res.message || "Product saved successfully!",
        "success",
      );
      setForm({
        productName: "",
        boxesCount: 1,
        quantityPerBox: 1,
        costPricePerBox: 1,
        sellingPricePerUnit: 1,
      });
    } catch (err) {
      triggerNotification(
        err.response?.data?.message || "Failed to save product.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  // STEP 1: FETCH BY ID FROM BACKEND WHEN CLICKING ADD SIGN
  const handleOpenAddStockModal = async (productId) => {
    setLoading(true);
    try {
      const responseData = await getProductById(productId);

      // Pulling directly from your backend nested configuration array signature
      const productObj =
        responseData?.product?.[0] || responseData?.product || responseData;

      if (!productObj) {
        throw new Error(
          "Product data template missing from response payload context.",
        );
      }

      setRestockProduct(productObj);
      // Pre-fill the editable input box with the current database count value
      setEditablePacksCount(productObj.boxesCount ?? "");
      setShowAddModal(true);
    } catch (err) {
      console.error("Error fetching direct item metrics profile:", err);
      triggerNotification(
        "Could not retrieve real-time item metrics from database.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateById = async (productId) => {
    setLoading(true);
    try {
      const responseData = await getProductById(productId);
      // Pulling directly from your backend nested configuration array signature
      const productObj =
        responseData?.product?.[0] || responseData?.product || responseData;
      if (!productObj) {
        throw new Error(
          "Product data template missing from response payload context.",
        );
      }

      setupdateStockProduct(true);
    } catch (err) {
      console.error("Error fetching direct item metrics profile:", err);
      triggerNotification(
        "Could not retrieve real-time item metrics from database.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: SAVE UPDATED PACKS VALUE TO BACKEND
  const handleSaveStockIncrease = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        packsToAdd: Number(editablePacksCount),
      };

      const res = await handleAdd(restockProduct._id, payload);
      const updatedProduct =
        res?.product?.[0] || res?.product || res?.data || res;

      // Update local state grid array reference with live server data properties
      setInventory(
        inventory.map((item) =>
          item._id === restockProduct._id
            ? { ...item, ...updatedProduct }
            : item,
        ),
      );

      setShowAddModal(false);
      triggerNotification(
        res.message || "Stock adjusted successfully!",
        "success",
      );
    } catch (err) {
      triggerNotification(
        err.response?.data?.message || "Failed to submit modifications.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inventory-page">
      <Navbar brand={mart} user={user} />

      <div className="inventory-container container">
        <header className="inventory-header">
          <h1>Shop Inventory</h1>
          <button className="add-goods-btn" onClick={() => setShowModal(true)}>
            + Add New Goods
          </button>
        </header>

        {notification.message && !showModal && !showAddModal && (
          <div className={`notification-banner ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <p className="loading-msg">⏳ Talking to Database...</p>
          </div>
        )}

        <div className="inventory-grid">
          {inventory.map((item, idx) => {
            const uniqueMenuId = item.id || `prod-${idx}`;

            return (
              <div key={uniqueMenuId} className="inventory-card glass">
                <div className="card-top">
                  <h3>{item.productName}</h3>
                  <span className="stock-badge">
                    {item.unitsLeft ?? 0} left
                  </span>

                  <div className="menu-container">
                    <button
                      type="button"
                      className="menu-btn"
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === uniqueMenuId ? null : uniqueMenuId,
                        )
                      }
                    >
                      ⋮
                    </button>

                    {activeMenu === uniqueMenuId && (
                      <div className="menu-dropdown">
                        <button
                          onClick={() => {
                            handleUpdateById(uniqueMenuId);

                            setActiveMenu(null);
                          }}
                        >
                          ✏️ Update
                        </button>

                        {/* Passes current item ID to trigger the background network request */}
                        <button
                          onClick={() => {
                            handleOpenAddStockModal(uniqueMenuId);
                            setActiveMenu(null);
                          }}
                        >
                          ➕ Add Stock
                        </button>

                        <button
                          className="delete-item-btn"
                          onClick={async () => {
                            setActiveMenu(null);
                            if (window.confirm("Delete this product?")) {
                              const response = await handleDelete(uniqueMenuId);
                              if (response.ok)
                                setInventory(
                                  inventory.filter(
                                    (p) => p._id !== uniqueMenuId,
                                  ),
                                );
                            }
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <span>Profits</span>
                    <strong>GHC{(item.profitSoFar ?? 0).toFixed(2)}</strong>
                  </div>
                  <div className="stat highlight">
                    <span>Est. Total Profit</span>
                    <strong>GHC{(item.totalProfit ?? 0).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="card-footer">
                  <span>{item.quantityPerBox} items/pack</span>
                  <span>Sell: GHC{item.sellingPricePerUnit}/ea</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: ADD BRAND NEW ENTRY */}
      {showModal && (
        <div className="modal-overlay">
          <form className="inventory-modal glass" onSubmit={handleAddGood}>
            <h2>Add New Product</h2>
            <div className="form-row">
              <div className="input-group">
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  disabled={saving}
                  value={form.productName}
                  onChange={(e) =>
                    setForm({ ...form, productName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Packs in Stock</label>
                <input
                  type="number"
                  min="1"
                  disabled={saving}
                  value={form.boxesCount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      boxesCount:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="input-group">
                <label>Items per Pack</label>
                <input
                  type="number"
                  min="1"
                  disabled={saving}
                  value={form.quantityPerBox}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantityPerBox:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Cost Price (Pack)</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={saving}
                  value={form.costPricePerBox}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      costPricePerBox:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="input-group">
                <label>Selling Price (Single Item)</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={saving}
                  value={form.sellingPricePerUnit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sellingPricePerUnit:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "Saving..." : "Save to Inventory"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: AUTO-FILLED RESTOCK MODAL VIEW FROM BACKEND ENTRY */}
      {showAddModal && restockProduct && (
        <div className="modal-overlay">
          <form
            className="inventory-modal glass"
            onSubmit={handleSaveStockIncrease}
          >
            <h2>Restock Supply: {restockProduct.productName}</h2>

            <div className="form-row">
              <div className="input-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={restockProduct.productName}
                  readOnly
                  className="read-only-input-element"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                {/* THE ONLY EDITABLE FIELD */}
                <label>Packs to add</label>
                <input
                  type="number"
                  min="0"
                  required
                  autoFocus
                  disabled={saving}
                  value={editablePacksCount}
                  onChange={(e) =>
                    setEditablePacksCount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="editable-stock-input-field"
                />
              </div>
              <div className="input-group">
                <label>Items per Pack</label>
                <input
                  type="number"
                  value={restockProduct.quantityPerBox}
                  readOnly
                  className="read-only-input-element"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Cost Price (Per Pack)</label>
                <input
                  type="number"
                  value={restockProduct.costPricePerBox}
                  readOnly
                  className="read-only-input-element"
                />
              </div>
              <div className="input-group">
                <label>Selling Price (Single Item)</label>
                <input
                  type="number"
                  value={restockProduct.sellingPricePerUnit}
                  readOnly
                  className="read-only-input-element"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Current Total Units Remaining</label>
                <input
                  type="number"
                  value={restockProduct.unitsLeft}
                  readOnly
                  className="read-only-input-element"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                disabled={saving}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "⏳ Saving Changes..." : "Update Stock Count"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: AUTO-FILLED RESTOCK MODAL VIEW FROM BACKEND ENTRY */}
      {showUpdateModal && updateStockProduct && (
        <div className="modal-overlay">
          <form
            className="inventory-modal glass"
            onSubmit={handleSaveStockIncrease}
          >
            <h2>Restock Supply: {updateStockProduct.productName}</h2>

            <div className="form-row">
              <div className="input-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={updateStockProduct.productName}
                  readOnly
                  className="read-only-input-element"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                {/* THE ONLY EDITABLE FIELD */}
                <label>Packs to add</label>
                <input
                  type="number"
                  min="0"
                  required
                  autoFocus
                  disabled={saving}
                  value={editablePacksCount}
                  onChange={(e) =>
                    setEditablePacksCount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="editable-stock-input-field"
                />
              </div>
              <div className="input-group">
                <label>Items per Pack</label>
                <input
                  type="number"
                  value={updateStockProduct.quantityPerBox}
                  readOnly
                  className="read-only-input-element"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Cost Price (Per Pack)</label>
                <input
                  type="number"
                  value={updateStockProduct.costPricePerBox}
                  readOnly
                  className="read-only-input-element"
                />
              </div>
              <div className="input-group">
                <label>Selling Price (Single Item)</label>
                <input
                  type="number"
                  value={updateStockProduct.sellingPricePerUnit}
                  readOnly
                  className="read-only-input-element"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Current Total Units Remaining</label>
                <input
                  type="number"
                  value={updateStockProduct.unitsLeft}
                  readOnly
                  className="read-only-input-element"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                disabled={saving}
                onClick={() => setshowUpdateModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "⏳ Saving Changes..." : "Update Stock Count"}
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}
