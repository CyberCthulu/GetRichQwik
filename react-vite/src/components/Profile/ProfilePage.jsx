// src/components/Profile/ProfilePage.jsx
import { useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import UpdateProfileModal from "./UpdateProfileModal";
import UpdateCashBalanceModal from "./UpdateCashBalanceModal.jsx";
// import "./ProfilePage.css"; // For styling

export default function ProfilePage() {
  const user = useSelector((state) => state.session.user);
  const { setModalContent } = useModal();

  if (!user) return <p>Loading...</p>;

  const openUpdateProfileModal = () => {
    setModalContent(
      <UpdateProfileModal
        user={user}
        onClose={() => setModalContent(null)}
      />
    );
  };

  const openUpdateCashBalanceModal = () => {
    setModalContent(
      <UpdateCashBalanceModal
        user={user}
        onClose={() => setModalContent(null)}
      />
    );
  };

  // Create a user icon from the first letter of first_name, or fallback
  const avatarLetter = user.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="profile-page">
      <div className="profile-header">
        {/* User Icon / Avatar */}
        <div className="profile-icon">
          <div className="avatar">{avatarLetter}</div>
        </div>

        <div className="profile-info">
          <h1>
            {user.first_name} {user.last_name}
          </h1>
          <p className="profile-username">@{user.username}</p>
        </div>
      </div>

      <div className="profile-details">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Cash Balance:</strong> ${Number(user.cash_balance).toFixed(2)}
        </p>
      </div>

      <div className="profile-actions">
        <button onClick={openUpdateProfileModal}>Update Profile</button>
        <button onClick={openUpdateCashBalanceModal}>Update Cash Balance</button>
      </div>
    </div>
  );
}
