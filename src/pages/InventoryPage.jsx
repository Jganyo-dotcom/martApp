import React, { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import "../styles/Inventory.css";
import Footer from "../components/Footer";

export default function InventoryPage() {
  const [showModal, setShowModal] = useState(false);
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: "Steel Nails",
      packs: 10,
      qtyPerPack: 50,
      costPrice: 20,
      sellPricePack: 30,
      sellPriceSingle: 0.8,
      singleProfit: 0.4,
      totalProfit: 100,
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    packs: 0,
    qtyPerPack: 0,
    costPrice: 0, // Cost of one pack
    sellPricePack: 0,
    sellPriceSingle: 0,
  });

  // Automatically calculate profits whenever form values change
  const calculations = useMemo(() => {
    const totalItems = form.packs * form.qtyPerPack;
    const costPerSingle =
      form.qtyPerPack > 0 ? form.costPrice / form.qtyPerPack : 0;

    const singleProfit = form.sellPriceSingle - costPerSingle;
    const totalProfit =
      form.sellPriceSingle * totalItems - form.costPrice * form.packs;

    return {
      singleProfit: singleProfit > 0 ? singleProfit.toFixed(2) : "0.00",
      totalProfit: totalProfit > 0 ? totalProfit.toFixed(2) : "0.00",
    };
  }, [form]);

  const handleAddGood = (e) => {
    e.preventDefault();
    const newGood = {
      ...form,
      id: Date.now(),
      singleProfit: calculations.singleProfit,
      totalProfit: calculations.totalProfit,
    };
    setInventory([newGood, ...inventory]);
    setShowModal(false);
    setForm({
      name: "",
      packs: 0,
      qtyPerPack: 0,
      costPrice: 0,
      sellPricePack: 0,
      sellPriceSingle: 0,
    });
  };

  return (
    <div className="inventory-page">
      <Navbar />

      <div className="inventory-container container">
        <header className="inventory-header">
          <div>
            <h1>Shop Inventory</h1>
            <p>Manage your stock and track potential profits</p>
          </div>
          <button className="add-goods-btn" onClick={() => setShowModal(true)}>
            + Add New Goods
          </button>
        </header>

        <div className="inventory-grid">
          {inventory.map((item) => (
            <div key={item.id} className="inventory-card glass">
              <div className="card-top">
                <h3>{item.name}</h3>
                <span className="stock-badge">{item.packs} Packs</span>
              </div>
              <div className="card-stats">
                <div className="stat">
                  <span>Single Profit</span>
                  <strong>GHC{item.singleProfit}</strong>
                </div>
                <div className="stat highlight">
                  <span>Est. Total Profit</span>
                  <strong>GHC{item.totalProfit}</strong>
                </div>
              </div>
              <div className="card-footer">
                <span>{item.qtyPerPack} items/pack</span>
                <span>Sell: GHC{item.sellPriceSingle}/ea</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD GOODS MODAL */}
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
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Packs in Stock</label>
                <input
                  type="number"
                  value={form.packs}
                  onChange={(e) =>
                    setForm({ ...form, packs: Number(e.target.value) })
                  }
                />
              </div>
              <div className="input-group">
                <label>Items per Pack</label>
                <input
                  type="number"
                  value={form.qtyPerPack}
                  onChange={(e) =>
                    setForm({ ...form, qtyPerPack: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Cost Price (Pack)</label>
                <input
                  type="number"
                  value={form.costPrice}
                  onChange={(e) =>
                    setForm({ ...form, costPrice: Number(e.target.value) })
                  }
                />
              </div>
              <div className="input-group">
                <label>Selling Price (Pack)</label>
                <input
                  type="number"
                  value={form.sellPricePack}
                  onChange={(e) =>
                    setForm({ ...form, sellPricePack: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Selling Price (Single Item)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.sellPriceSingle}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sellPriceSingle: Number(e.target.value),
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
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Save to Inventory
              </button>
            </div>
          </form>
        </div>
      )}
      <Footer />
    </div>
  );
}
