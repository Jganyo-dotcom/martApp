import React, { useState, useMemo, useEffect } from "react";
import {
  getAllProducts,
  addProduct,
  handleDelete,
  handleAdd,
  handleUpdate,
} from "../services/productApi";
import Navbar from "../components/Navbar";
import "../styles/Inventory.css";
import Footer from "../components/Footer";

export default function InventoryPage() {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });

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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getAllProducts();
        const productsList = Array.isArray(data) ? data : data.products || [];
        setInventory(productsList);

        if (data.message) {
          triggerNotification(data.message, "success");
        }
      } catch (err) {
        console.error("Failed to load products:", err.message);
        const serverError =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch products.";
        triggerNotification(serverError, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  const mart = localStorage.getItem("mart");
  const user = localStorage.getItem("user");
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

  const handleAddGood = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        productName: form.productName,
        boxesCount: form.boxesCount === "" ? 1 : form.boxesCount,
        quantityPerBox: form.quantityPerBox === "" ? 1 : form.quantityPerBox,
        costPricePerBox: form.costPricePerBox === "" ? 0 : form.costPricePerBox,
        sellingPricePerUnit:
          form.sellingPricePerUnit === "" ? 0 : form.sellingPricePerUnit,
      };

      const res = await addProduct(payload);
      const targetProduct = res?.product || res?.data || res;

      const formattedProduct = {
        ...targetProduct,
        singleProfit: targetProduct.singleProfit || calculations.singleProfit,
        totalProfit: targetProduct.totalProfit || calculations.totalProfit,
      };

      setInventory([formattedProduct, ...inventory]);
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
      console.error("Error adding product:", err.message);
      const backendError =
        err.response?.data?.message || err.message || "Failed to save product.";
      triggerNotification(backendError, "error");
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
          <p>Manage your stock</p>
          <button className="add-goods-btn" onClick={() => setShowModal(true)}>
            + Add New Goods
          </button>
        </header>

        {notification.message && !showModal && (
          <div className={`notification-banner ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <p className="loading-msg">⏳ Fetching products...</p>
          </div>
        )}

        <div className="inventory-grid">
          {inventory.map((item, idx) => {
            // Safe key resolution matching your identifier properties
            const uniqueMenuId = item._id || item.id || `prod-${idx}`;

            return (
              <div key={uniqueMenuId} className="inventory-card glass">
                <div className="card-top">
                  <h3>{item.productName}</h3>
                  <span className="stock-badge">
                    {item.unitsLeft ?? 0} left
                  </span>

                  {/* Vertical menu button container */}
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

                    {/* Render dropdown menu if and only if this menu ID matches active state */}
                    {activeMenu === uniqueMenuId && (
                      <div className="menu-dropdown">
                        <button
                          onClick={() => {
                            handleUpdate(uniqueMenuId);
                            setActiveMenu(null);
                          }}
                        >
                          ✏️ Update
                        </button>
                        <button
                          onClick={() => {
                            handleAdd(uniqueMenuId);
                            setActiveMenu(null);
                          }}
                        >
                          ➕ Add
                        </button>
                        <button
                          className="delete-item-btn"
                          onClick={async () => {
                            setActiveMenu(null);
                            if (
                              window.confirm(
                                "Are you sure you want to delete this product?",
                              )
                            ) {
                              const response = await handleDelete(uniqueMenuId);
                              if (response.ok) {
                                setInventory(
                                  inventory.filter(
                                    (p) =>
                                      (p._id ||
                                        p.id ||
                                        `prod-${inventory.indexOf(p)}`) !==
                                      uniqueMenuId,
                                  ),
                                );
                                alert("Product deleted successfully!");
                              } else {
                                alert("Failed to delete product");
                              }
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
                    <strong>GHC{item.profitSoFar.toFixed(2) ?? "0.00"}</strong>
                  </div>
                  <div className="stat highlight">
                    <span>Est. Total Profit</span>
                    <strong>GHC{item.totalProfit.toFixed(2) ?? "0.00"}</strong>
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

      {showModal && (
        <div className="modal-overlay">
          <form className="inventory-modal glass" onSubmit={handleAddGood}>
            <h2>Add New Product</h2>

            {notification.message && (
              <div className={`notification-banner ${notification.type}`}>
                {notification.type === "error" ? "❌" : "✅"}{" "}
                {notification.message}
              </div>
            )}

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
                  min="1"
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
                  min="0"
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

            <div className="profit-display">
              <div className="profit-box">
                <label>Profit per Single</label>
                <div className="value">GHC{calculations.singleProfit}</div>
              </div>
              <div className="profit-box total">
                <label>Total Expected Profit</label>
                <div className="value">GHC{calculations.totalProfit}</div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                disabled={saving}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "⏳ Saving..." : "Save to Inventory"}
              </button>
            </div>
          </form>
        </div>
      )}
      <Footer />
    </div>
  );
}
