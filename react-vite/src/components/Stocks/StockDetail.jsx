import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadOneStock } from "../../redux/stocks";
import { useModal } from "../../context/Modal";
import BuyOrderModal from "./BuyOrderModal";
import AddToWatchlistModal from "./AddToWatchlistModal";
import { Line } from "react-chartjs-2";
import "./StockDetail.css";

/** 
 * Generate simulated chart data. 
 * (For demonstration; adjust logic if you have real data.)
 */
function generateSimulatedChartData(basePrice, timeRange) {
  let dataPoints;
  let stepInHours;

  switch (timeRange) {
    case "1D":
      dataPoints = 8;
      stepInHours = 3; // 8 points, 3 hours apart
      break;
    case "1W":
      dataPoints = 7;
      stepInHours = 24; // 7 daily points
      break;
    case "1M":
      dataPoints = 30;
      stepInHours = 24; // 30 daily points
      break;
    case "3M":
      dataPoints = 12;
      stepInHours = 24 * 7; // 12 weekly points
      break;
    case "YTD":
    case "1Y":
      dataPoints = 12;
      stepInHours = 24 * 30; // 12 monthly points
      break;
    case "ALL":
      dataPoints = 10;
      stepInHours = 24 * 365; // 10 yearly points
      break;
    default:
      dataPoints = 8;
      stepInHours = 3;
  }

  const now = new Date();
  const data = [];

  for (let i = 0; i < dataPoints; i++) {
    // small random fluctuation ±1.5%
    const fluctuation = (Math.random() - 0.5) * basePrice * 0.03;
    const simulatedPrice = Math.max(basePrice + fluctuation, 0);

    const dateObj = new Date(now);
    dateObj.setHours(dateObj.getHours() - stepInHours * (dataPoints - i - 1));

    data.push({
      date: dateObj.toLocaleString([], { month: "numeric", day: "numeric" }),
      price: simulatedPrice,
    });
  }

  return data;
}

export default function StockDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const stock = useSelector((state) => state.stocks[id]);
  const { setModalContent } = useModal();

  // Real-time price from WebSocket
  const [localPrice, setLocalPrice] = useState(null);
  // Chart time range
  const [timeRange, setTimeRange] = useState("1D");
  // Simulated chart data
  const [chartData, setChartData] = useState([]);

  // For the dedicated WS connection
  const wsRef = useRef(null);

  // 1) Load stock info
  useEffect(() => {
    dispatch(thunkLoadOneStock(id));
  }, [dispatch, id]);

  // 2) WebSocket for real-time price
  useEffect(() => {
    if (!stock) return;
    const ticker = stock.ticker_symbol;
    const wsUrl = `wss://ws.finnhub.io?token=${import.meta.env.VITE_FINNHUB_API_KEY}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS open for:", ticker);
      ws.send(JSON.stringify({ type: "subscribe", symbol: ticker }));
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type === "trade" && data.data) {
          data.data.forEach((trade) => {
            if (trade.s === ticker) {
              setLocalPrice(trade.p);
            }
          });
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "unsubscribe", symbol: ticker }));
      }
      ws.close();
    };
  }, [stock]);

  // 3) Generate (or fetch) chart data on localPrice/timeRange changes
  useEffect(() => {
    if (!stock) return;
    const price = localPrice != null ? localPrice : stock.market_price;
    const simData = generateSimulatedChartData(price, timeRange);
    setChartData(simData);
  }, [stock, localPrice, timeRange]);

  if (!stock) {
    return <div>Loading stock details...</div>;
  }

  const displayedPrice = localPrice != null ? localPrice : stock.market_price;

  // Prepare Chart.js data
  const chartJSData = {
    labels: chartData.map((p) => p.date),
    datasets: [
      {
        label: `${stock.ticker_symbol} Price`,
        data: chartData.map((p) => p.price),
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
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
      {/* Top "header" row with ticker, company, price, sector */}
      <div className="stock-header">
        <div className="left-info">
          <h1>
            {stock.ticker_symbol} – {stock.company_name}
          </h1>
          <p>Sector: {stock.sector}</p>
        </div>
        <div className="right-info">
          <p>Current Price: ${displayedPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="main-content">
        {/* Left side: chart */}
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

        {/* Right side: buy stock card */}
        <div className="buy-stock-card">
          <h2>Buy {stock.ticker_symbol}</h2>
          <p>Market Price: ${displayedPrice.toFixed(2)}</p>
          <button onClick={handleReviewOrder}>Review Order</button>
          <button onClick={handleAddToWatchlist}>Add to List</button>
        </div>
      </div>
    </div>
  );
}
