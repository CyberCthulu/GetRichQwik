import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.session.user);

  if (!user) {
    // If no user in Redux state, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the child component
  return children;
}
