// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"; // for navigation
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
import { thunkLoadRecentStocks } from "../../redux/stocks";

import "./Dashboard.css";

export default function Dashboard() {
  const dispatch = useDispatch();

  // Get data from Redux:
  // - watchlists and portfolios remain the same.
  // - recentStocks comes from state.stocks.recent.
  const watchlists = useSelector((state) => Object.values(state.watchlists));
  const portfolios = useSelector((state) => Object.values(state.portfolios));
  const recentStocks = useSelector((state) => state.stocks.recent) || [];

  // Local state for chart data, time range, and watchlist expansion.
  const [timeRange, setTimeRange] = useState("1D");
  const [chartData, setChartData] = useState([]);
  const [expanded, setExpanded] = useState({});

  // Deduplicate recent stocks by id (in case of duplicates).
  const dedupedRecentStocks = [
    ...new Map(recentStocks.map((stock) => [stock.id, stock])).values(),
  ];

  // Toggle expansion for a specific watchlist.
  const toggleWatchlist = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Simulated function to generate chart data based on the time range.
  const generateSimulatedChartData = (range) => {
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
      value: Math.floor(Math.random() * 20000) + 10000,
    }));
  };

  // Load data on component mount.
  useEffect(() => {
    dispatch(thunkLoadWatchlists());
    dispatch(thunkLoadPortfolios());
    dispatch(thunkLoadRecentStocks());
  }, [dispatch]);

  // Update chart data when the time range changes.
  useEffect(() => {
    const simulatedData = generateSimulatedChartData(timeRange);
    setChartData(simulatedData);
  }, [timeRange]);

  // Prepare Chart.js data.
  const lineChartData = {
    labels: chartData.map((point) => point.date),
    datasets: [
      {
        label: "Portfolio Value",
        data: chartData.map((point) => point.value),
        borderColor: "rgb(75, 192, 120)",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Total Portfolio Value (${timeRange})` },
    },
    scales: {
      x: { grid: { display: true } },
      y: { grid: { display: true } },
    },
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="dashboard-main-content">
        {/* Left Column: Chart Section */}
        <div className="dashboard-chart-section">
          <h2>Investment Overview</h2>
          <Line data={lineChartData} options={lineChartOptions} />
          <div className="time-range-buttons">
            {["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? "active-range" : ""}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Cards Section */}
        <div className="dashboard-cards-column">
          {/* Recently Viewed Stocks Card */}
          <div className="stocks-card">
            <h3>Recently Viewed Stocks</h3>
            {dedupedRecentStocks && dedupedRecentStocks.length > 0 ? (
              dedupedRecentStocks.slice(0, 3).map((stock) => (
                <div key={stock.id} className="stock-item">
                  <p>
                    <strong>{stock.ticker_symbol}</strong> –{" "}
                    {stock.company_name}
                  </p>
                </div>
              ))
            ) : (
              <p>No recent stocks available.</p>
            )}
          </div>
          
          {/* Watchlists with Dropdown Functionality */}
          <div className="watchlists-card">
            <h3>
              <Link to="/watchlists">My Watchlists</Link>
            </h3>
            {watchlists && watchlists.length > 0 ? (
              watchlists.map((wl) => (
                <div key={wl.id} className="watchlist-item">
                  <div className="watchlist-header">
                    <strong>{wl.name}</strong>
                    <button onClick={() => toggleWatchlist(wl.id)}>
                      {expanded[wl.id] ? "Hide" : "Show"}
                    </button>
                  </div>
                  {expanded[wl.id] && (
                    wl.stocks && wl.stocks.length > 0 ? (
                      <ul>
                        {wl.stocks.map((stock) => (
                          <li key={stock.id}>{stock.company_name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No stocks in this watchlist.</p>
                    )
                  )}
                </div>
              ))
            ) : (
              <p>No watchlists found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
