// src/components/StockDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadOneStock } from "../../redux/stocks";
import { useModal } from "../../context/Modal";
import BuyOrderModal from "./BuyOrderModal";
import AddToWatchlistModal from "./AddToWatchlistModal";
import { Line } from "react-chartjs-2";
import "./StockDetail.css";

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
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Generate simulated chart data.
 * - 1D: 60 data points (past hour), random walk with a slightly bigger delta (±0.3%)
 * - Other ranges: fewer points, ±3% deltas
 */
function generateSimulatedChartData(basePrice, timeRange) {
  const now = new Date();
  let data = [];

  if (timeRange === "1D") {
    // 60 data points for the past hour
    const dataPoints = 60;
    let currentPrice = basePrice;
    for (let i = 0; i < dataPoints; i++) {
      // Slightly bigger delta for more noticeable decimal changes (±0.3%)
      const delta = (Math.random() - 0.5) * basePrice * 0.003;
      currentPrice = Math.max(currentPrice + delta, 0);

      const dateObj = new Date(now.getTime() - (dataPoints - i - 1) * 60 * 1000);
      const timeString = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      data.push({ date: timeString, price: currentPrice });
    }
  } else {
    // For other ranges, fewer points with a bigger ±3% fluctuation
    let dataPoints, stepInHours;
    switch (timeRange) {
      case "1W":
        dataPoints = 7;
        stepInHours = 24;
        break;
      case "1M":
        dataPoints = 30;
        stepInHours = 24;
        break;
      case "3M":
        dataPoints = 12;
        stepInHours = 24 * 7;
        break;
      case "YTD":
      case "1Y":
        dataPoints = 12;
        stepInHours = 24 * 30;
        break;
      case "ALL":
        dataPoints = 10;
        stepInHours = 24 * 365;
        break;
      default:
        dataPoints = 8;
        stepInHours = 3;
    }
    let currentPrice = basePrice;
    for (let i = 0; i < dataPoints; i++) {
      const delta = (Math.random() - 0.5) * basePrice * 0.03;
      currentPrice = Math.max(currentPrice + delta, 0);

      const dateObj = new Date(now);
      dateObj.setHours(dateObj.getHours() - stepInHours * (dataPoints - i - 1));
      const dateString = dateObj.toLocaleDateString([], { month: "numeric", day: "numeric" });
      data.push({ date: dateString, price: currentPrice });
    }
  }
  return data;
}

export default function StockDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const stock = useSelector((state) => state.stocks.byId[id]);
  const { setModalContent } = useModal();

  // Chart time range
  const [timeRange, setTimeRange] = useState("1D");
  const [chartData, setChartData] = useState([]);

  // Global y-axis range that only expands
  const [yAxisRange, setYAxisRange] = useState({ min: Infinity, max: -Infinity });

  // 1) Load stock info on mount, then poll
  useEffect(() => {
    dispatch(thunkLoadOneStock(id));
    const intervalId = setInterval(() => {
      dispatch(thunkLoadOneStock(id));
    }, 3000);
    return () => clearInterval(intervalId);
  }, [dispatch, id]);

  // 2) Generate new chart data
  useEffect(() => {
    if (!stock) return;
    const simData = generateSimulatedChartData(stock.market_price, timeRange);
    setChartData(simData);
  }, [stock, timeRange]);

  // 3) Update y-axis range if new data breaks outside old range
  useEffect(() => {
    if (chartData.length === 0) return;
    const prices = chartData.map((p) => p.price);
    const dataMin = Math.min(...prices);
    const dataMax = Math.max(...prices);

    setYAxisRange((prev) => {
      return {
        min: Math.min(prev.min, dataMin),
        max: Math.max(prev.max, dataMax),
      };
    });
  }, [chartData]);

  if (!stock) {
    return <div>Loading stock details...</div>;
  }

  const displayedPrice = stock.market_price;

  // Larger buffer to create a taller y-axis
  const rangeDiff = yAxisRange.max - yAxisRange.min;
  const buffer = rangeDiff * 0.2 || 1; // 20% buffer if range>0, else fallback

  const yMin = yAxisRange.min - buffer;
  const yMax = yAxisRange.max + buffer;

  // Prepare Chart.js data
  const chartJSData = {
    labels: chartData.map((p) => p.date),
    datasets: [
      {
        label: `${stock.ticker_symbol} Price`,
        data: chartData.map((p) => p.price),
        borderColor: "rgba(75,192,192,1)",
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  // Only expand the axis if new data requires it; never shrink
  const chartOptions = {
    responsive: true,
    // Animate transitions to see smooth re-scaling
    animation: {
      duration: 600,
      easing: "easeInOutQuad",
    },
    scales: {
      y: {
        min: Number.isFinite(yMin) ? yMin : 0,
        max: Number.isFinite(yMax) ? yMax : 100,
        // Force decimal display with stepSize
        ticks: {
          stepSize: 0.5, // Adjust as needed
          callback: (value) => value.toFixed(2),
        },
      },
    },
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `${stock.ticker_symbol} - ${timeRange}` },
    },
  };

  // Modal handlers
  const handleReviewOrder = () => {
    setModalContent(<BuyOrderModal stockId={id} />);
  };
  const handleAddToWatchlist = () => {
    setModalContent(<AddToWatchlistModal stockId={id} />);
  };

  return (
    <div className="stock-detail">
      {/* Header row */}
      <div className="stock-header">
        <div className="left-info">
          <h1>
            {stock.ticker_symbol} – {stock.company_name}
          </h1>
          <p>Sector: {stock.sector}</p>
        </div>
        <div className="right-info">
          <p>Current Price: ${Number(displayedPrice).toFixed(2)}</p>
        </div>
      </div>

      <div className="main-content">
        {/* Chart Section */}
        <div className="chart-section">
          <Line data={chartJSData} options={chartOptions} />
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

        {/* Buy Stock Card */}
        <div className="buy-stock-card">
          <h2>Buy {stock.ticker_symbol}</h2>
          <p>Market Price: ${Number(displayedPrice).toFixed(2)}</p>
          <div className="buy-stock-card-buttons">
            <button onClick={handleReviewOrder}>Review Order</button>
            <button onClick={handleAddToWatchlist}>Add to List</button>
          </div>
        </div>
      </div>
    </div>
  );
}
