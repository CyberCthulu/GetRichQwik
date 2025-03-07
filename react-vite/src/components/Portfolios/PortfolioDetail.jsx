import { useParams } from "react-router-dom";

export default function PortfolioDetail() {
  const { id } = useParams(); // Grab the portfolio ID from the URL

  return (
    <div>
      <h1>Portfolio Detail</h1>
      <p>Portfolio ID: {id}</p>
      {/* Later: Display holdings, orders, etc. */}
    </div>
  );
}
