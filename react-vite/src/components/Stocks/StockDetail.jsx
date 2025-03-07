import { useParams } from "react-router-dom";

export default function StockDetail() {
  const { id } = useParams(); // Grab the stock ID from the URL

  return (
    <div>
      <h1>Stock Detail</h1>
      <p>Stock ID: {id}</p>
      {/* Later: Show price chart, stats, Buy button, etc. */}
    </div>
  );
}
