// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Import Redux thunks
import { thunkLoadWatchlists } from "../../redux/watchlists";
import { thunkLoadPortfolios } from "../../redux/portfolios";

// If you have a thunk to load recent stocks, import that too:
// import { thunkLoadRecentStocks } from "../../redux/stocks";

export default function Dashboard() {
  const dispatch = useDispatch();

  // Get watchlists and portfolios from Redux
  const watchlists = useSelector((state) =>
    Object.values(state.watchlists)
  );
  const portfolios = useSelector((state) =>
    Object.values(state.portfolios)
  );

  // For recent stocks, assume it's stored under state.stocks.recent.
  // If not present, simulate with an empty array.
  const recentStocks = useSelector((state) => state.stocks.recent) || [
    // Simulation: Remove this once you have real data
    {
      id: 1,
      ticker_symbol: "AAPL",
      company_name: "Apple Inc.",
    },
    {
      id: 2,
      ticker_symbol: "MSFT",
      company_name: "Microsoft Corporation",
    },
    {
      id: 3,
      ticker_symbol: "GOOGL",
      company_name: "Alphabet Inc.",
    },
  ];

  // Local state for the selected time range and chart data
  const [timeRange, setTimeRange] = useState("1D");
  const [chartData, setChartData] = useState([]);

  // Simulated function to generate chart data based on the time range.
  // In production, you might dispatch a thunk that computes aggregated portfolio value.
  const generateSimulatedChartData = (range) => {
    // In a real scenario, you might compute the total portfolio value using portfolios and holdings.
    // For simulation, we'll create 7 data points.
    const labels = [
      "2025-03-01",
      "2025-03-02",
      "2025-03-03",
      "2025-03-04",
      "2025-03-05",
      "2025-03-06",
      "2025-03-07",
    ];
    return labels.map((label) => ({
      date: label,
      // Simulate a value between 10000 and 30000 (could represent total portfolio value)
      value: Math.floor(Math.random() * 20000) + 10000,
    }));
  };

  // On component mount, load watchlists and portfolios.
  useEffect(() => {
    dispatch(thunkLoadWatchlists());
    dispatch(thunkLoadPortfolios());
    // If you have recent stocks thunk, dispatch that too.
    // dispatch(thunkLoadRecentStocks());
  }, [dispatch]);

  // Load (or compute) chart data whenever the time range changes.
  useEffect(() => {
    // Replace with a thunk if available, e.g., dispatch(thunkLoadDashboardData(timeRange))
    const simulatedData = generateSimulatedChartData(timeRange);
    setChartData(simulatedData);
  }, [timeRange]);

  // Prepare Chart.js data structure.
  const lineChartData = {
    labels: chartData.map((point) => point.date),
    datasets: [
      {
        label: "Portfolio Value",
        data: chartData.map((point) => point.value),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Total Portfolio Value (${timeRange})`,
      },
    },
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {/* Chart Section */}
      <div className="dashboard-chart-section">
        <h2>Investment Overview</h2>
        <Line data={lineChartData} options={lineChartOptions} />
        <div className="time-range-buttons">
          {["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                fontWeight: timeRange === range ? "bold" : "normal",
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Section */}
      <div className="dashboard-cards-section">
        {/* Recently Viewed Stocks Card */}
        <div className="stocks-card">
          <h3>Recently Viewed Stocks</h3>
          {recentStocks && recentStocks.length > 0 ? (
            recentStocks.slice(0, 3).map((stock) => (
              <div key={stock.id} className="stock-item">
                <p>
                  <strong>{stock.ticker_symbol}</strong> – {stock.company_name}
                </p>
              </div>
            ))
          ) : (
            <p>No recent stocks available.</p>
          )}
        </div>
        
        {/* Watchlists Card */}
        <div className="watchlists-card">
          <h3>My Watchlists</h3>
          {watchlists && watchlists.length > 0 ? (
            watchlists.map((wl) => (
              <div key={wl.id} className="watchlist-item">
                <strong>{wl.name}</strong>
                {wl.stocks && wl.stocks.length > 0 ? (
                  <ul>
                    {wl.stocks.map((stockId) => (
                      <li key={stockId}>Stock ID: {stockId}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No stocks in this watchlist.</p>
                )}
              </div>
            ))
          ) : (
            <p>No watchlists found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
