import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Profit.css";
import {
  fetchSales,
  fetchTotalProfit,
  deleteSaleItem,
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

  // 2. Action Handler: Clean asynchronous delete mutation
  const handleDelete = async (saleId, inputer, quantity, productName) => {
    if (!saleId) return alert("Error: Missing sale ID.");

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sale record?",
    );
    if (!confirmDelete) return;

    try {
      const response = await deleteSaleItem(
        saleId,
        inputer,
        quantity,
        productName,
      );
      alert(response?.message || "Item deleted successfully.");

      setSalesData((prevSales) => {
        return prevSales
          .map((sale) => {
            if (sale._id !== saleId) return sale;

            const updatedItems = sale.items.filter(
              (item) =>
                !(
                  item.productName === productName && item.quantity === quantity
                ),
            );

            return { ...sale, items: updatedItems };
          })
          .filter(
            (sale) =>
              sale && Array.isArray(sale.items) && sale.items.length > 0,
          );
      });

      setSummary((prevSummary) => ({
        ...prevSummary,
        itemsSold: Math.max(0, (prevSummary?.itemsSold || 0) - quantity),
      }));
    } catch (err) {
      console.error("Failed to delete record:", err.message);
      alert("Failed to delete sale record: " + err.message);
    }
  };

  // 3. Flatten structural database arrays securely
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
          customerName: sale?.customerName?.trim() || "Walk-in Customer",
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
  const mart = localStorage.getItem("mart");
  const user = localStorage.getItem("user");
  const totalItems = flattenedRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const normalizedCurrentPage =
    currentPage > totalPages ? totalPages : currentPage;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const indexOfLastItem = normalizedCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = flattenedRows.slice(indexOfFirstItem, indexOfLastItem);

  const textTruncateStyle = {
    maxWidth: "160px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div className="profit-page">
      <Navbar brand={mart} user={user} />

      <div className="container profit-container">
        <header className="profit-header">
          <h1 style={{ fontSize: "1.75rem", margin: "0 0 0.25rem 0" }}>
            Financial Overview
          </h1>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
            Real-time tracking of sales and net earnings
          </p>
        </header>

        {loading ? (
          <div className="loading-overlay">
            <p className="loading-msg">⏳ Fetching profit data...</p>
          </div>
        ) : (
          <>
            {/* TOP STATS CARDS */}
            <div className="stats-row">
              <div className="stat-card glass glow-blue">
                <span>Total Revenue</span>
                <h2 style={{ wordBreak: "break-all" }}>
                  GHC{" "}
                  {(
                    (summary?.totalProfit ?? 0) + (summary?.totalexpense ?? 0)
                  ).toFixed(2)}
                </h2>
              </div>
              <div className="stat-card glass glow-green">
                <span>Net Profit</span>
                <h2 className="text-green" style={{ wordBreak: "break-all" }}>
                  GHC{" "}
                  {(
                    (summary?.totalProfit ?? 0) - (summary?.totalExpense ?? 0)
                  ).toFixed(2)}
                </h2>
              </div>
              <div className="stat-card glass">
                <span>Items Sold</span>
                <h2 style={{ wordBreak: "break-all" }}>
                  {summary?.itemsSold ?? 0} Units
                </h2>
              </div>
            </div>

            {/* MAIN CONTENT SECTION */}
            <section className="sales-section glass">
              <h3>Recent Sales Breakdown</h3>

              {/* DESKTOP TABLE VIEW */}
              <div className="desktop-table-view">
                <div className="table-wrapper">
                  <table
                    className="profit-table"
                    style={{ width: "100%", tableLayout: "fixed" }}
                  >
                    <colgroup>
                      <col style={{ width: "22%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "8%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Qty</th>
                        <th>Customer</th>
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
                            <td
                              className="font-bold"
                              style={textTruncateStyle}
                              title={row.productName}
                            >
                              {row.productName}
                            </td>
                            <td>{row.quantity}</td>
                            <td
                              className="text-muted"
                              style={textTruncateStyle}
                              title={row.customerName}
                            >
                              {row.customerName}
                            </td>
                            <td>GHC {(row.unitPrice || 0).toFixed(2)}</td>
                            <td className="text-green font-bold">
                              +GHC {(row.profit || 0).toFixed(2)}
                            </td>
                            <td style={textTruncateStyle} title={row.inputer}>
                              {row.inputer}
                            </td>
                            <td className="text-muted">
                              {row.createdAt
                                ? new Date(row.createdAt).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                className="delete-row-btn"
                                onClick={() =>
                                  handleDelete(
                                    row.parentSaleId,
                                    row.inputer,
                                    row.quantity,
                                    row.productName,
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "1.1rem",
                                  padding: "4px",
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
              </div>

              {/* MOBILE STREAMLINED CARD VIEW */}
              <div className="mobile-cards-view">
                {currentRows.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      opacity: 0.7,
                    }}
                  >
                    No sales data found.
                  </div>
                ) : (
                  currentRows.map((row) => (
                    <div key={row.uniqueKey} className="mobile-sale-card glass">
                      <div className="mobile-card-row">
                        <span className="font-bold mobile-product-title">
                          {row.productName}
                        </span>
                        <button
                          className="delete-row-btn"
                          onClick={() =>
                            handleDelete(
                              row.parentSaleId,
                              row.inputer,
                              row.quantity,
                              row.productName,
                            )
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                          }}
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="mobile-card-details">
                        <div className="detail-item">
                          <span className="detail-label">Qty Sold</span>
                          <span className="detail-value">{row.quantity}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Customer</span>
                          <span
                            className="detail-value text-muted"
                            style={{
                              maxWidth: "120px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.customerName}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Unit Price</span>
                          <span className="detail-value">
                            GHC {row.unitPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Net Profit</span>
                          <span className="detail-value text-green font-bold">
                            +GHC {row.profit.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mobile-card-subfoot">
                        <span>By: {row.inputer}</span>
                        <span>
                          {row.createdAt
                            ? new Date(row.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PAGINATION INTERFACE CONTROLS */}
              {totalPages > 1 && (
                <div className="pagination-bar">
                  <button
                    disabled={normalizedCurrentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
