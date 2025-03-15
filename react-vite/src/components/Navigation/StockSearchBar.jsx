// src/components/Navigation/StockSearchBar.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Make sure this path is correct for your project structure.
import { csrfFetch } from "../../redux/csrf";

export default function StockSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // Debounce search so that API is called only after 300ms of inactivity.
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

  // Fetch suggestions using the new Flask endpoint.
  const fetchSuggestions = async (q) => {
    try {
      const trimmedQuery = q.trim();
      const res = await csrfFetch(
        `/api/stocks/search?q=${encodeURIComponent(trimmedQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        // data.stocks comes from your seeded database.
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
    // Navigate using the numeric id if available.
    const target = stock.id ? stock.id : stock.ticker_symbol;
    navigate(`/stocks/${target}`);
    setQuery("");
    setResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If exactly one result, navigate to its detail page.
    if (results.length === 1) {
      handleResultClick(results[0]);
    } else if (query.trim()) {
      // Otherwise, navigate to a search results page.
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
