import { useModal } from "../../context/Modal"
import SignupFormPage from "../../components/SignupFormPage";

export default function LandingPage() {
  const { setModalContent } = useModal();

  const openSignupModal = () => {
    setModalContent(<SignupFormPage />);
  };

    return (
      <div>
        <h1>GetRichQwik!</h1>
        <p>Welcome to GetRichQwik!</p>
        <p>Learn how to make your Money Work for you!</p>
        <button onClick={openSignupModal}>Get Started</button>
      </div>
    );
  }
  