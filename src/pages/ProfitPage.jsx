import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Profit.css";
import Footer from "../components/Footer";

export default function ProfitPage() {
  // Mock Backend Data
  const [salesData] = useState([
    {
      id: 1,
      name: "Power Drill 20V",
      qtySold: 12,
      costPrice: 80,
      sellPrice: 120,
      totalProfit: 480,
      date: "2026-05-10",
    },
    {
      id: 2,
      name: "Steel Nails (Pack)",
      qtySold: 45,
      costPrice: 10,
      sellPrice: 18,
      totalProfit: 360,
      date: "2026-05-11",
    },
    {
      id: 3,
      name: "Safety Goggles",
      qtySold: 20,
      costPrice: 5,
      sellPrice: 12,
      totalProfit: 140,
      date: "2026-05-12",
    },
    {
      id: 4,
      name: "Heavy Duty Hammer",
      qtySold: 8,
      costPrice: 15,
      sellPrice: 25,
      totalProfit: 80,
      date: "2026-05-13",
    },
  ]);

  // Calculate Totals for the Top Cards
  const totalRevenue = salesData.reduce(
    (acc, curr) => acc + curr.sellPrice * curr.qtySold,
    0,
  );
  const totalProfit = salesData.reduce(
    (acc, curr) => acc + curr.totalProfit,
    0,
  );
  const itemsSold = salesData.reduce((acc, curr) => acc + curr.qtySold, 0);

  return (
    <div className="profit-page">
      <Navbar />

      <div className="container profit-container">
        <header className="profit-header">
          <h1>Financial Overview</h1>
          <p>Real-time tracking of sales and net earnings</p>
        </header>

        {/* 3 PRETTY TOP CARDS */}
        <div className="stats-row">
          <div className="stat-card glass glow-blue">
            <span>Total Revenue</span>
            <h2>GHC{totalRevenue.toLocaleString()}</h2>
            <div className="trend up">+12.5% this week</div>
          </div>
          <div className="stat-card glass glow-green">
            <span>Net Profit</span>
            <h2 className="text-green">GHC{totalProfit.toLocaleString()}</h2>
            <div className="trend up">+8.2% vs last month</div>
          </div>
          <div className="stat-card glass">
            <span>Items Sold</span>
            <h2>{itemsSold} Units</h2>
            <div className="trend">Across all categories</div>
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
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale) => (
                  <tr key={sale.id}>
                    <td className="font-bold">{sale.name}</td>
                    <td>{sale.qtySold}</td>
                    <td className="text-muted">GHC{sale.costPrice}</td>
                    <td>GHC{sale.sellPrice}</td>
                    <td className="text-green font-bold">
                      +GHC{sale.totalProfit}
                    </td>
                    <td className="text-muted">{sale.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
