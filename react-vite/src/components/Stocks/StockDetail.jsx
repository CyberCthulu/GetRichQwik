// // src/components/StockDetail/StockDetail.jsx
// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { thunkLoadOneStock } from "../../redux/stocks";
// import { useModal } from "../../context/Modal";
// import BuyOrderModal from "./BuyOrderModal";
// import AddToWatchlistModal from "./AddToWatchlistModal";
// import { Line } from "react-chartjs-2";


// // Helper function: generate simulated historical candle data
// function generateSimulatedChartData(basePrice, days = 10) {
//   const data = [];
//   const today = new Date();
//   // For each of the past 'days' (older to recent)
//   for (let i = days - 1; i >= 0; i--) {
//     const date = new Date(today);
//     date.setDate(date.getDate() - i);
//     // Simulate a slight fluctuation around basePrice (you can adjust the randomness)
//     const fluctuation = (Math.random() - 0.5) * 10; // ±5 units variation
//     const simulatedPrice = basePrice + fluctuation;
//     data.push({
//       date: date.toLocaleDateString(),
//       price: Math.max(simulatedPrice, 0), // Ensure price isn’t negative
//     });
//   }
//   return data;
// }

// export default function StockDetail() {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const stock = useSelector((state) => state.stocks[id]);
//   const { setModalContent } = useModal();

//   const [timeRange, setTimeRange] = useState("1D");
//   const [chartData, setChartData] = useState([]);
//   // localPrice holds the real‑time price update for the current stock
//   const [localPrice, setLocalPrice] = useState(null);
//   // Ref for the dedicated WebSocket connection
//   const wsRef = useRef(null);

//   // 1) Load the stock info from the server on mount
//   useEffect(() => {
//     dispatch(thunkLoadOneStock(id));
//   }, [dispatch, id]);

//   // 2) Set up a dedicated WebSocket connection for real‑time price updates
//   useEffect(() => {
//     if (!stock) return; // Wait until stock data is loaded
//     const ticker = stock.ticker_symbol;
//     const FINNHUB_WS_URL = `wss://ws.finnhub.io?token=${import.meta.env.VITE_FINNHUB_API_KEY}`;
//     const ws = new WebSocket(FINNHUB_WS_URL);
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("Dedicated WS connection opened for", ticker);
//       ws.send(JSON.stringify({ type: "subscribe", symbol: ticker }));
//     };

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         if (data.type === "trade" && data.data) {
//           data.data.forEach((trade) => {
//             if (trade.s === ticker) {
//               // Update local price with the latest trade price
//               setLocalPrice(trade.p);
//               console.log(`Received update for ${ticker}: ${trade.p}`);
//             }
//           });
//         }
//       } catch (error) {
//         console.error("Error parsing WS message:", error);
//       }
//     };

//     ws.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     // Cleanup: Unsubscribe and close WS connection on unmount
//     return () => {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(JSON.stringify({ type: "unsubscribe", symbol: ticker }));
//       }
//       ws.close();
//     };
//   }, [stock]);

//   // 3) Generate simulated historical chart data whenever the price or timeRange changes
//   useEffect(() => {
//     if (!stock) return;
//     // Use the real-time localPrice if available; otherwise, use DB price
//     const basePrice = localPrice !== null ? localPrice : stock.market_price;
//     // For now, generate simulated data regardless of timeRange (you could modify this per range)
//     const simulatedData = generateSimulatedChartData(basePrice, 10);
//     setChartData(simulatedData);
//   }, [stock, localPrice, timeRange]);

//   if (!stock) {
//     return <div>Loading stock details...</div>;
//   }

//   // Determine the displayed price
//   const displayedPrice = localPrice !== null ? localPrice : stock.market_price;

//   // Handlers for modals
//   const handleReviewOrder = () => {
//     setModalContent(<BuyOrderModal stockId={id} />);
//   };

//   const handleAddToWatchlist = () => {
//     setModalContent(<AddToWatchlistModal stockId={id} />);
//   };

//   // Prepare the data for Chart.js
//   const chartJSData = {
//     labels: chartData.map((point) => point.date),
//     datasets: [
//       {
//         label: `${stock.ticker_symbol} Price`,
//         data: chartData.map((point) => point.price),
//         borderColor: "rgba(75,192,192,1)",
//         fill: false,
//       },
//     ],
//   };

//   const chartJSOptions = {
//     responsive: true,
//     plugins: {
//       legend: { position: "top" },
//       title: { display: true, text: `${stock.ticker_symbol} - ${timeRange}` },
//     },
//   };

//   return (
//     <div className="stock-detail">
//       <h1>
//         {stock.ticker_symbol} – {stock.company_name}
//       </h1>
//       <p>Sector: {stock.sector}</p>
//       <p>Current Price: ${Number(displayedPrice).toFixed(2)}</p>
//       <div className="chart-section">
//         <Line data={chartJSData} options={chartJSOptions} />
//         <div className="time-range-buttons">
//           {["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"].map((range) => (
//             <button
//               key={range}
//               onClick={() => setTimeRange(range)}
//               style={{ fontWeight: timeRange === range ? "bold" : "normal" }}
//             >
//               {range}
//             </button>
//           ))}
//         </div>
//       </div>
//       <div className="buy-stock-card">
//         <h2>Buy {stock.ticker_symbol}</h2>
//         <p>Market Price: ${Number(displayedPrice).toFixed(2)}</p>
//         <button onClick={handleReviewOrder}>Review Order</button>
//         <button onClick={handleAddToWatchlist}>Add to List</button>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadOneStock } from "../../redux/stocks";
import { useModal } from "../../context/Modal";
import BuyOrderModal from "./BuyOrderModal";
import AddToWatchlistModal from "./AddToWatchlistModal";
import { Line } from "react-chartjs-2";

/**
 * Generate simulated historical data based on the selected time range.
 * For "1D", we generate e.g. 8 hourly points; for "1W", 7 daily points, etc.
 */
function generateSimulatedChartData(basePrice, timeRange) {
  let dataPoints;
  let stepInHours = 24; // default daily

  switch (timeRange) {
    case "1D":
      dataPoints = 8;  // 8 hourly points for the day
      stepInHours = 3; // each point ~3 hours
      break;
    case "1W":
      dataPoints = 7;  // 7 daily points
      stepInHours = 24;
      break;
    case "1M":
      dataPoints = 30; // 30 daily points
      stepInHours = 24;
      break;
    case "3M":
      dataPoints = 12; // e.g. 12 weekly points
      stepInHours = 24 * 7;
      break;
    case "YTD":
    case "1Y":
      dataPoints = 12; // 12 monthly points
      stepInHours = 24 * 30;
      break;
    case "ALL":
      dataPoints = 10; // e.g. 10 yearly points
      stepInHours = 24 * 365;
      break;
    default:
      dataPoints = 8;
      stepInHours = 3;
  }

  const now = new Date();
  const data = [];

  for (let i = 0; i < dataPoints; i++) {
    // random fluctuation around basePrice (± 1.5%)
    const fluctuation = (Math.random() - 0.5) * basePrice * 0.03;
    const simulatedPrice = Math.max(basePrice + fluctuation, 0);

    const dateObj = new Date(now);
    // Each iteration goes backward in time by stepInHours
    dateObj.setHours(dateObj.getHours() - stepInHours * (dataPoints - i - 1));

    data.push({
      // e.g. "3/12/2025, 2:00 PM" or short date
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

  // Real-time local price from WebSocket
  const [localPrice, setLocalPrice] = useState(null);
  // Time range for chart
  const [timeRange, setTimeRange] = useState("1D");
  // Simulated chart data
  const [chartData, setChartData] = useState([]);

  // Keep a reference to the dedicated WebSocket so we can close it
  const wsRef = useRef(null);

  /**
   * 1) Load the stock data from the backend
   */
  useEffect(() => {
    dispatch(thunkLoadOneStock(id));
  }, [dispatch, id]);

  /**
   * 2) Set up a dedicated WebSocket for real-time price updates
   */
  useEffect(() => {
    if (!stock) return;
    const ticker = stock.ticker_symbol;
    const wsUrl = `wss://ws.finnhub.io?token=${import.meta.env.VITE_FINNHUB_API_KEY}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS open for:", ticker);
      // subscribe to real-time trades
      ws.send(JSON.stringify({ type: "subscribe", symbol: ticker }));
    };

    ws.onmessage = (evt) => {
      try {
        const parsed = JSON.parse(evt.data);
        if (parsed.type === "trade" && parsed.data) {
          for (const trade of parsed.data) {
            if (trade.s === ticker) {
              setLocalPrice(trade.p);
              // console.log(`[WS] ${ticker} => ${trade.p}`);
            }
          }
        }
      } catch (err) {
        console.error("Error parsing WS data:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "unsubscribe", symbol: ticker }));
      }
      ws.close();
    };
  }, [stock]);

  /**
   * 3) Generate or fetch historical data whenever localPrice or timeRange changes
   */
  useEffect(() => {
    if (!stock) return;
    const currentPrice = localPrice != null ? localPrice : stock.market_price;
    const simulatedData = generateSimulatedChartData(currentPrice, timeRange);
    setChartData(simulatedData);
  }, [stock, localPrice, timeRange]);

  if (!stock) {
    return <div>Loading stock details...</div>;
  }

  const displayedPrice = localPrice != null ? localPrice : stock.market_price;

  // Chart.js data
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
      <h1>
        {stock.ticker_symbol} – {stock.company_name}
      </h1>
      <p>Sector: {stock.sector}</p>
      <p>Current Price: ${displayedPrice.toFixed(2)}</p>

      {/* Chart Section */}
      <div className="chart-section">
        <Line data={chartJSData} options={chartOptions} />
        {/* Time Range Buttons */}
        <div className="time-range-buttons">
          {["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{ fontWeight: timeRange === range ? "bold" : "normal" }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Buy Stock Card */}
      <div className="buy-stock-card">
        <h2>Buy {stock.ticker_symbol}</h2>
        <p>Market Price: ${displayedPrice.toFixed(2)}</p>
        <button onClick={handleReviewOrder}>Review Order</button>
        <button onClick={handleAddToWatchlist}>Add to List</button>
      </div>
    </div>
  );
}
