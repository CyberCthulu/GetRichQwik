// src/components/StockDetail/StockDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadOneStock } from "../../redux/stocks";
import { useModal } from "../../context/Modal";
import BuyOrderModal from "./BuyOrderModal";
import AddToWatchlistModal from "./AddToWatchlistModal";
import { Line } from "react-chartjs-2";

export default function StockDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const stock = useSelector((state) => state.stocks[id]);
  const { setModalContent } = useModal();

  const [timeRange, setTimeRange] = useState("1D");
  const [chartData, setChartData] = useState([]);

  // Load the stock info on mount
  useEffect(() => {
    dispatch(thunkLoadOneStock(id));
  }, [dispatch, id]);

  // Mock or real chart data fetch whenever timeRange changes
  useEffect(() => {
    const simulatedData = [
      { date: "2025-03-01", price: 150 },
      { date: "2025-03-02", price: 152 },
      { date: "2025-03-03", price: 148 },
      { date: "2025-03-04", price: 155 },
    ];
    setChartData(simulatedData);
  }, [timeRange]);

  if (!stock) {
    return <div>Loading stock details...</div>;
  }

  // Handlers for the two buttons
  const handleReviewOrder = () => {
    setModalContent(<BuyOrderModal stockId={id} />);
  };

  const handleAddToWatchlist = () => {
    setModalContent(<AddToWatchlistModal stockId={id} />);
  };

  // Chart.js data and options
  const chartJSData = {
    labels: chartData.map((point) => point.date),
    datasets: [
      {
        label: `${stock.ticker_symbol} Price`,
        data: chartData.map((point) => point.price),
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
    ],
  };

  const chartJSOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `${stock.ticker_symbol} - ${timeRange}` },
    },
  };

  return (
    <div className="stock-detail">
      <h1>
        {stock.ticker_symbol} – {stock.company_name}
      </h1>
      <p>Sector: {stock.sector}</p>
      <p>Current Price: ${Number(stock.market_price).toFixed(2)}</p>

      {/* Chart Section */}
      <div className="chart-section">
        <Line data={chartJSData} options={chartJSOptions} />
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

      {/* Buy Stock Card */}
      <div className="buy-stock-card">
      <h2>Buy {stock.ticker_symbol}</h2>
      <p>Market Price: ${Number(stock.market_price).toFixed(2)}</p>
        <button onClick={handleReviewOrder}>Review Order</button>
        <button onClick={handleAddToWatchlist}>Add to List</button>
      </div>
    </div>
  );
}
