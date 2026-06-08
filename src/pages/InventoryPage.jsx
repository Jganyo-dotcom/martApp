import React, { useState, useMemo, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getAllProducts,
  addProduct,
  handleDelete,
  getProductById,
  handleUpdate, // For general data field updates
  handleAdd, // For restock quantities operations
} from "../services/productApi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Inventory.css";

export default function InventoryPage() {
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setshowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);

  const [restockProduct, setRestockProduct] = useState(null);
  const [updateStockProduct, setupdateStockProduct] = useState(null);
  const [editablePacksCount, setEditablePacksCount] = useState("");

  // Holds editable product parameters dynamically inside Modal 3
  const [updateform, setUpdateForm] = useState({
    productName: "",
    noBoxes: 0,
    itemsPerBox: 0,
    new_costPricePerBox: 0,
    new_sellingPricePerUnit: 0,
  });

  const handleChangeValues = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({
      ...prev,
      [name]:
        value === "" ? "" : name === "productName" ? value : Number(value),
    }));
  };

  const [form, setForm] = useState({
    productName: "",
    boxesCount: 1,
    quantityPerBox: 1,
    costPricePerBox: 1,
    sellingPricePerUnit: 1,
  });

  // Fetch all initial products on layout mount context
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
        toast.error("Failed to fetch inventory goods from backend server.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const mart = localStorage.getItem("mart");
  const user = localStorage.getItem("user");

  // Local live computations for adding brand new goods modal layout frame
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

  // ACTION 1: Submit Brand New Product Data Payload Structure
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
      toast.success(res?.message || "Product saved successfully! 🎉");

      setForm({
        productName: "",
        boxesCount: 1,
        quantityPerBox: 1,
        costPricePerBox: 1,
        sellingPricePerUnit: 1,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  // ACTION 2: Open and Pre-fill Restock Quantities Modal View (Modal 2)
  const handleOpenAddStockModal = async (productId) => {
    setLoading(true);
    try {
      const responseData = await getProductById(productId);
      const productObj =
        responseData?.product?.[0] || responseData?.product || responseData;

      if (!productObj) {
        throw new Error(
          "Product metadata missing from database response context.",
        );
      }

      setRestockProduct(productObj);
      setEditablePacksCount(productObj.boxesCount ?? "");
      setShowAddModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Could not retrieve real-time item metrics.");
    } finally {
      setLoading(false);
    }
  };

  // ACTION 3: Submit Simple Restock Count Increments (Modal 2 Submit Handler)
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!restockProduct?._id) return;

    setSaving(true);
    const payload = {
      packsToAdd: Number(editablePacksCount),
    };

    try {
      const res = await handleAdd(restockProduct._id, payload);
      const updatedProduct =
        res?.product?.[0] || res?.product || res?.data || res;

      setInventory((prev) =>
        prev.map((item) =>
          item._id === restockProduct._id
            ? { ...item, ...updatedProduct }
            : item,
        ),
      );

      setShowAddModal(false);
      toast.success(res?.message || "Stock metrics replenished cleanly! 🚀");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to adjust stock updates.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ACTION 4: Open and Populate Full Product Form Parameters For General Editing (Modal 3)
  const handleUpdateById = async (productId) => {
    setLoading(true);
    try {
      const responseData = await getProductById(productId);
      const productObj =
        responseData?.product?.[0] || responseData?.product || responseData;

      if (!productObj) {
        throw new Error("Failed to capture product payload templates.");
      }

      setupdateStockProduct(productObj);

      // Pre-fill fields perfectly mapped directly into state
      setUpdateForm({
        productName: productObj.productName || "",
        noBoxes: productObj.boxesCount ?? 0,
        itemsPerBox: productObj.quantityPerBox ?? 0,
        new_costPricePerBox: productObj.costPricePerBox ?? 0,
        new_sellingPricePerUnit: productObj.sellingPricePerUnit ?? 0,
      });

      setshowUpdateModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Could not load real-time item configuration details.");
    } finally {
      setLoading(false);
    }
  };

  // ACTION 5: Save Custom Full Parameter Record Edits (Modal 3 Submit Handler)
  const handleSaveStockIncrease = async (e) => {
    e.preventDefault();
    if (!updateStockProduct?._id) return;

    setSaving(true);

    // Compute explicit calculations dynamically if backend demands raw total metrics calculated manually
    const compositeTotalCost =
      Number(updateform.noBoxes) * Number(updateform.new_costPricePerBox);

    // Construct precise payload parameters requested explicitly by the database router schemas
    const payload = {
      productName: updateform.productName,
      newSellingPricePerUnit: Number(updateform.new_sellingPricePerUnit),
      new_costPricePerBox: Number(updateform.new_costPricePerBox),
      new_totalcost: compositeTotalCost,
      itemsPerBox: Number(updateform.itemsPerBox),
      noBoxes: Number(updateform.noBoxes),
    };

    try {
      const res = await handleUpdate(updateStockProduct._id, payload);
      const updatedProduct =
        res?.product?.[0] || res?.product || res?.data || res;

      setInventory((prev) =>
        prev.map((item) =>
          item._id === updateStockProduct._id
            ? { ...item, ...updatedProduct }
            : item,
        ),
      );

      setshowUpdateModal(false);
      toast.success(
        res?.message || "Product data configurations successfully updated! 💅",
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update target record fields.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inventory-page">
      <ToastContainer theme="dark" />
      <Navbar brand={mart} user={user} />

      <div className="inventory-container container">
        <header className="inventory-header">
          <h1>Shop Inventory</h1>
          <button className="add-goods-btn" onClick={() => setShowModal(true)}>
            + Add New Goods
          </button>
        </header>

        {loading && (
          <div className="loading-overlay">
            <p className="loading-msg">⏳ Talking to Database...</p>
          </div>
        )}

        <div className="inventory-grid">
          {inventory.map((item, idx) => {
            const uniqueMenuId = item._id || item.id || `prod-${idx}`;

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
                          ✏️ Update Details
                        </button>

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
                              try {
                                const response =
                                  await handleDelete(uniqueMenuId);
                                if (response.ok || response.success !== false) {
                                  setInventory(
                                    inventory.filter(
                                      (p) => p._id !== uniqueMenuId,
                                    ),
                                  );
                                  toast.success(
                                    "Product removed from inventory.",
                                  );
                                }
                              } catch {
                                toast.error(
                                  "Could not drop target entity entry.",
                                );
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

            {/* LIVE AUTO-CALCULATED PROFIT VALUES DISPLAY AREA */}
            <div className="form-row live-profit-preview">
              <div className="input-group calculation-display-card">
                <span className="calc-label">Est. Profit / Single Item</span>
                <strong className="calc-value neon-text-green">
                  GHC {calculations.singleProfit}
                </strong>
              </div>
              <div className="input-group calculation-display-card">
                <span className="calc-label">Est. Full Batch Total Profit</span>
                <strong className="calc-value neon-text-glow">
                  GHC {calculations.totalProfit}
                </strong>
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

      {/* MODAL 2: ADD STOCK (RESTOCK ONLY) */}
      {showAddModal && restockProduct && (
        <div className="modal-overlay">
          <form className="inventory-modal glass" onSubmit={handleUpdateStock}>
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

      {/* MODAL 3: UPDATE CURRENT SELECTION ENTRY (ALL FIELDS EDITABLE) */}
      {showUpdateModal && updateStockProduct && (
        <div className="modal-overlay">
          <form
            className="inventory-modal glass"
            onSubmit={handleSaveStockIncrease}
          >
            <h2>Update Info: {updateStockProduct.productName}</h2>

            <div className="form-row">
              <div className="input-group">
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  name="productName"
                  disabled={saving}
                  value={updateform.productName}
                  onChange={handleChangeValues}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Total Packs</label>
                <input
                  type="number"
                  min="0"
                  required
                  name="noBoxes"
                  disabled={saving}
                  value={updateform.noBoxes}
                  onChange={handleChangeValues}
                />
              </div>
              <div className="input-group">
                <label>Items per Pack</label>
                <input
                  type="number"
                  min="1"
                  required
                  name="itemsPerBox"
                  disabled={saving}
                  value={updateform.itemsPerBox}
                  onChange={handleChangeValues}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Cost Price (Per Pack)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="new_costPricePerBox"
                  disabled={saving}
                  value={updateform.new_costPricePerBox}
                  onChange={handleChangeValues}
                />
              </div>
              <div className="input-group">
                <label>Selling Price (Single Item)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="new_sellingPricePerUnit"
                  disabled={saving}
                  value={updateform.new_sellingPricePerUnit}
                  onChange={handleChangeValues}
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
                {saving ? "⏳ Saving Changes..." : "Update Details"}
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}
