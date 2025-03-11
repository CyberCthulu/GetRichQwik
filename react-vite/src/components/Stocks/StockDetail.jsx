// // src/components/StockDetail/StockDetail.jsx
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { thunkLoadOneStock } from "../../redux/stocks";
// import { useModal } from "../../context/Modal";
// import BuyOrderModal from "./BuyOrderModal";
// import AddToWatchlistModal from "./AddToWatchlistModal";
// import { Line } from "react-chartjs-2";

// export default function StockDetail() {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const stock = useSelector((state) => state.stocks[id]);
//   const { setModalContent } = useModal();

//   const [timeRange, setTimeRange] = useState("1D");
//   const [chartData, setChartData] = useState([]);

//   // Load the stock info on mount
//   useEffect(() => {
//     dispatch(thunkLoadOneStock(id));
//   }, [dispatch, id]);

//   // Mock or real chart data fetch whenever timeRange changes
//   useEffect(() => {
//     const simulatedData = [
//       { date: "2025-03-01", price: 150 },
//       { date: "2025-03-02", price: 152 },
//       { date: "2025-03-03", price: 148 },
//       { date: "2025-03-04", price: 155 },
//     ];
//     setChartData(simulatedData);
//   }, [timeRange]);

//   if (!stock) {
//     return <div>Loading stock details...</div>;
//   }

//   // Handlers for the two buttons
//   const handleReviewOrder = () => {
//     setModalContent(<BuyOrderModal stockId={id} />);
//   };

//   const handleAddToWatchlist = () => {
//     setModalContent(<AddToWatchlistModal stockId={id} />);
//   };

//   // Chart.js data and options
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
//       <p>Current Price: ${Number(stock.market_price).toFixed(2)}</p>

//       {/* Chart Section */}
//       <div className="chart-section">
//         <Line data={chartJSData} options={chartJSOptions} />
//         <div className="time-range-buttons">
//           {["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"].map((range) => (
//             <button
//               key={range}
//               onClick={() => setTimeRange(range)}
//               style={{
//                 fontWeight: timeRange === range ? "bold" : "normal",
//               }}
//             >
//               {range}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Buy Stock Card */}
//       <div className="buy-stock-card">
//       <h2>Buy {stock.ticker_symbol}</h2>
//       <p>Market Price: ${Number(stock.market_price).toFixed(2)}</p>
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

export default function StockDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const stock = useSelector((state) => state.stocks[id]);
  const { setModalContent } = useModal();

  const [timeRange, setTimeRange] = useState("1D");
  const [chartData, setChartData] = useState([]);
  const [localPrice, setLocalPrice] = useState(null);
  const wsRef = useRef(null);

  // 1) Always load the stock from the server
  useEffect(() => {
    dispatch(thunkLoadOneStock(id));
  }, [dispatch, id]);

  // 2) Set up your WebSocket once stock is loaded
  useEffect(() => {
    // If the stock is not loaded yet, do nothing
    if (!stock) return;

    const ticker = stock.ticker_symbol;
    const FINNHUB_WS_URL = `wss://ws.finnhub.io?token=${import.meta.env.VITE_FINNHUB_API_KEY}`;
    console.log('Finnhub key:', import.meta.env.VITE_FINNHUB_API_KEY);
    const ws = new WebSocket(FINNHUB_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS open for:", ticker);
      ws.send(JSON.stringify({ type: "subscribe", symbol: ticker }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "trade" && data.data) {
          data.data.forEach((trade) => {
            if (trade.s === ticker) {
              setLocalPrice(trade.p);
              console.log(`Received update for ${ticker}: ${trade.p}`);
            }
          });
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "unsubscribe", symbol: ticker }));
      }
      ws.close();
    };
  }, [stock]);

  // 3) Chart data effect (always declared)
  useEffect(() => {
    // If no stock yet, skip
    if (!stock) return;

    // Use the localPrice if available, else the DB price
    const displayedPrice = localPrice !== null ? localPrice : stock.market_price;

    // Replace with real chart data if available:
    const simulatedData = [
      { date: "2025-03-01", price: displayedPrice },
      { date: "2025-03-02", price: displayedPrice },
      { date: "2025-03-03", price: displayedPrice },
      { date: "2025-03-04", price: displayedPrice },
    ];
    setChartData(simulatedData);
  }, [stock, localPrice, timeRange]);

  // 4) After all hooks are declared, handle the "no stock" case
  if (!stock) {
    return <div>Loading stock details...</div>;
  }

  // Use localPrice if available; fallback to DB price
  const displayedPrice = localPrice !== null ? localPrice : stock.market_price;

  const handleReviewOrder = () => {
    setModalContent(<BuyOrderModal stockId={id} />);
  };

  const handleAddToWatchlist = () => {
    setModalContent(<AddToWatchlistModal stockId={id} />);
  };

  // Chart.js
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
      <p>
        Current Price: $
        {Number(displayedPrice).toFixed(2)}
      </p>

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
        <p>Market Price: ${Number(displayedPrice).toFixed(2)}</p>
        <button onClick={handleReviewOrder}>Review Order</button>
        <button onClick={handleAddToWatchlist}>Add to List</button>
      </div>
    </div>
  );
}
