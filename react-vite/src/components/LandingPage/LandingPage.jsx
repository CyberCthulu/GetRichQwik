// src/components/LandingPage/LandingPage.jsx

import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useModal } from "../../context/Modal";
import SignupFormPage from "../../components/SignupFormPage";
import "./LandingPage.css"; 

export default function LandingPage() {
  const sessionUser = useSelector((state) => state.session.user);
  const { setModalContent } = useModal();

  // If user is logged in, immediately redirect to the dashboard
  if (sessionUser) return <Navigate to="/dashboard" replace />;

  const openSignupModal = () => {
    setModalContent(<SignupFormPage />);
  };

  return (
    <div className="landing-page-container">
      <h1>GetRichQwik!</h1>
      <p>Welcome to GetRichQwik!</p>
      <p>Learn how to make your Money Work for you!</p>
      <button onClick={openSignupModal}>Get Started</button>
    </div>
  );
}
