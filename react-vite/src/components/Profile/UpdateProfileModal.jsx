// src/components/Profile/UpdateProfileModal.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkUpdateUser } from "../../redux/users";

export default function UpdateProfileModal({ user, onClose }) {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [username, setUsername] = useState(user.username || "");
  // If you want to update password, add password state here

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      first_name: firstName,
      last_name: lastName,
      email,
      username,
      // password,
    };

    try {
      const updatedUser = await dispatch(
        thunkUpdateUser(user.id, formData)
      );
      if (updatedUser) {
        onClose();
      }
    } catch (err) {
      if (err && typeof err.json === "function") {
        try {
          const errorResponse = await err.json();
          setErrors(
            errorResponse.errors ||
              { general: errorResponse.message || "An error occurred." }
          );
        } catch (parseError) {
          setErrors({ general: "An unexpected error occurred. Please try again." });
        }
      } else {
        console.error("Network or unknown error:", err);
        setErrors({ general: "A network error occurred. Please try again." });
      }
    }
  };

  return (
    <div className="update-profile-modal">
      <h2>Update Profile</h2>
      {errors.general && <p className="error">{errors.general}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          {errors.first_name && <p className="error">{errors.first_name}</p>}
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          {errors.last_name && <p className="error">{errors.last_name}</p>}
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>
        {/* 
          If you want to let the user update their password, 
          add fields for password & confirm password here 
        */}
        <button type="submit">Save Changes</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}
