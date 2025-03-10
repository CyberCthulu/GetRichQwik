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

  const fetchSuggestions = async (q) => {
    try {
      const queryTrimmed = q.trim();
      // Pass both ticker and company query parameters
      const res = await csrfFetch(
        `/api/stocks/?ticker=${encodeURIComponent(queryTrimmed)}&company=${encodeURIComponent(queryTrimmed)}`
      );
      if (res.ok) {
        const data = await res.json();
        const stocks = data.stocks || [];
        setResults(stocks);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching stock suggestions:", error);
      setResults([]);
    }
  };

  const handleResultClick = (stockId) => {
    navigate(`/stocks/${stockId}`);
    setQuery("");
    setResults([]);
  };

  // On form submission, if one result is found, navigate to it; otherwise, navigate to a search results page.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (results.length === 1) {
      navigate(`/stocks/${results[0].id}`);
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
          {results.map((stock) => (
            <li
              key={stock.id}
              onClick={() => handleResultClick(stock.id)}
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
