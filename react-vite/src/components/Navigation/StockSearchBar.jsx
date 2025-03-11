// src/components/Navigation/StockSearchBar.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { csrfFetch } from "../../redux/csrf";

export default function StockSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // Debounce the search so that the API is called only after 300ms of inactivity
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // This endpoint should now only search within the seeded stocks in your database.
  const fetchSuggestions = async (q) => {
    try {
      const queryTrimmed = q.trim();
      const res = await csrfFetch(
        `/api/stocks/search?q=${encodeURIComponent(queryTrimmed)}`
      );
      if (res.ok) {
        const data = await res.json();
        // data.stocks will come solely from your seeded stocks
        setResults(data.stocks || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching stock suggestions:", error);
      setResults([]);
    }
  };

  const handleResultClick = (stock) => {
    // Use the numeric id if available; otherwise, fallback to the ticker symbol.
    const target = stock.id ? stock.id : stock.ticker_symbol;
    navigate(`/stocks/${target}`);
    setQuery("");
    setResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (results.length === 1) {
      handleResultClick(results[0]);
    } else if (query.trim()) {
      navigate(`/stocks?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="stock-search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Search by ticker or company..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((stock, index) => (
            <li
              key={stock.id || index}
              onClick={() => handleResultClick(stock)}
              className="search-result-item"
            >
              {stock.ticker_symbol} – {stock.company_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
