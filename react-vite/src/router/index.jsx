import { createBrowserRouter } from 'react-router-dom';
import LoginFormPage from '../components/LoginFormPage';
import SignupFormPage from '../components/SignupFormPage';
import Layout from './Layout';
// import LandingPage from "../components/LandingPage/LandingPage";
// import Dashboard from "../components/Dashboard/Dashboard";
// import PortfolioList from "../components/Portfolios/PortfolioList";
// import PortfolioDetail from "../components/Portfolios/PortfolioDetail";
// import OrdersPage from "../components/Orders/OrdersPage";
// import WatchlistsPage from "../components/Watchlists/WatchlistsPage";
// import ProfilePage from "../components/Profile/ProfilePage";
// import StockDetail from "../components/Stocks/StockDetail";
// import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";



export const router = createBrowserRouter([
  {
    element: <Layout />, // The shared layout (Navigation, <Outlet/>, ModalProvider, etc.)
    children: [
      {
        path: "/",
        // element: <LandingPage />,
      },
      {
        path: "login",
        element: <LoginFormPage />,
      },
      {
        path: "signup",
        element: <SignupFormPage />,
      },
      // Protected routes
      // {
      //   path: "dashboard",
      //   element: (
      //     <ProtectedRoute>
      //       <Dashboard />
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "portfolios",
      //   element: (
      //     <ProtectedRoute>
      //       <PortfolioList />
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "portfolios/:id",
      //   element: (
      //     <ProtectedRoute>
      //       <PortfolioDetail />
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "orders",
      //   element: (
      //     <ProtectedRoute>
      //       <OrdersPage />
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "watchlists",
      //   element: (
      //     <ProtectedRoute>
      //       <WatchlistsPage />
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "profile",
      //   element: (
      //     <ProtectedRoute>
      //       <ProfilePage />
      //     </ProtectedRoute>
      //   ),
      // },
      // {
      //   path: "stocks/:id",
      //   element: (
      //     <ProtectedRoute>
      //       <StockDetail />
      //     </ProtectedRoute>
      //   ),
      // },
      // // Fallback for any unmatched routes
      // {
      //   path: "*",
      //   element: <h2>Page Not Found</h2>,
      // },
    ],
  },
]);