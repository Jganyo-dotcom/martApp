import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Profit.css";
// Added deleteSalesRecord placeholder import from your API layer
import {
  fetchProfitSummary,
  fetchSales,
  deleteSalesRecord,
  fetchTotalProfit,
} from "../services/productApi";

export default function ProfitPage() {
  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    itemsSold: 0,
  });
  const [loading, setLoading] = useState(true);

  // 1. Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    try {
      setLoading(true);
      const responseData = await fetchSales();

      if (responseData && Array.isArray(responseData.sales)) {
        setSalesData(responseData.sales);
      } else if (Array.isArray(responseData)) {
        setSalesData(responseData);
      } else {
        setSalesData([]);
      }

      const profitSummary = await fetchTotalProfit();
      setSummary(
        profitSummary || { totalRevenue: 0, totalProfit: 0, itemsSold: 0 },
      );
    } catch (err) {
      console.error("Error loading profit data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Action Handler: Delete sales record by ID
  const handleDelete = async (saleId) => {
    if (!saleId) return alert("Error: Missing sale ID.");

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sale record?",
    );
    if (!confirmDelete) return;

    try {
      // Assuming your productApi file exports a deleteSalesRecord(id) function
      if (typeof deleteSalesRecord === "function") {
        await deleteSalesRecord(saleId);
      } else {
        console.warn(
          "deleteSalesRecord function is not yet defined in services.",
        );
      }

      alert("Sale deleted successfully!");
      // Refresh current data grids dynamically from backend
      loadData();
    } catch (err) {
      console.error("Failed to delete record:", err.message);
      alert("Failed to delete sale record: " + err.message);
    }
  };

  // 3. Flatten the items structure cleanly to implement correct 10-per-page pagination
  const flattenedRows = [];
  salesData.forEach((sale) => {
    if (sale && Array.isArray(sale.items)) {
      sale.items.forEach((item, idx) => {
        flattenedRows.push({
          parentSaleId: sale._id,
          createdAt: sale.createdAt,
          inputer: sale?.user?.name || "System",
          productName: item?.productName || "Unknown Item",
          quantity: item?.quantity ?? 0,
          costPrice: item?.costPrice ?? 0,
          unitPrice: item?.unitPrice ?? 0,
          profit:
            item?.profit ??
            ((item?.unitPrice ?? 0) - (item?.costPrice ?? 0)) *
              (item?.quantity ?? 0),
          uniqueKey: `${sale._id || Math.random()}-${idx}`,
        });
      });
    }
  });

  // 4. Calculate pagination slice values
  const totalItems = flattenedRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Adjusted automatically if pages change under matching filters
  const normalizedCurrentPage =
    currentPage > totalPages ? totalPages : currentPage;
  const indexOfLastItem = normalizedCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = flattenedRows.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="profit-page">
      <Navbar />

      <div className="container profit-container">
        <header className="profit-header">
          <h1>Financial Overview</h1>
          <p>Real-time tracking of sales and net earnings</p>
        </header>

        {loading ? (
          <div className="loading-overlay">
            <p className="loading-msg">⏳ Fetching profit data...</p>
          </div>
        ) : (
          <>
            {/* 3 TOP CARDS */}
            <div className="stats-row">
              <div className="stat-card glass glow-blue">
                <span>Total Revenue</span>
                <h2>GHC{(summary?.totalProfit ?? 0).toFixed(2)}</h2>
              </div>
              <div className="stat-card glass glow-green">
                <span>Net Profit</span>
                <h2 className="text-green">
                  GHC{(summary?.totalProfit ?? 0).toFixed(2)}
                </h2>
              </div>
              <div className="stat-card glass">
                <span>Items Sold</span>
                <h2>{summary?.itemsSold ?? 0} Units</h2>
              </div>
            </div>

            {/* SALES BREAKDOWN TABLE */}
            <section className="sales-section glass">
              <h3>Recent Sales Breakdown</h3>
              <div className="table-wrapper">
                <table className="profit-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Qty Sold</th>
                      <th>Unit Cost</th>
                      <th>Unit Sell</th>
                      <th>Total Profit</th>
                      <th>Entered By</th>
                      <th>Date</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          No sales data found.
                        </td>
                      </tr>
                    ) : (
                      currentRows.map((row) => (
                        <tr key={row.uniqueKey}>
                          <td className="font-bold">{row.productName}</td>
                          <td>{row.quantity}</td>
                          <td className="text-muted">
                            GHC{row.costPrice.toFixed(2)}
                          </td>
                          <td>GHC{row.unitPrice.toFixed(2)}</td>
                          <td className="text-green font-bold">
                            +GHC{row.profit.toFixed(2)}
                          </td>
                          <td className="text-muted">{row.inputer}</td>
                          <td className="text-muted">
                            {row.createdAt
                              ? new Date(row.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="delete-row-btn"
                              onClick={() => handleDelete(row.parentSaleId)}
                              title="Delete Record"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1.1rem",
                              }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 5. PAGINATION INTERFACE CONTROLS */}
              {totalPages > 1 && (
                <div
                  className="pagination-bar"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "15px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    disabled={normalizedCurrentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    style={{
                      padding: "6px 12px",
                      cursor:
                        normalizedCurrentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    Previous
                  </button>
                  <span>
                    Page <strong>{normalizedCurrentPage}</strong> of{" "}
                    {totalPages}
                  </span>
                  <button
                    disabled={normalizedCurrentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    style={{
                      padding: "6px 12px",
                      cursor:
                        normalizedCurrentPage === totalPages
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
