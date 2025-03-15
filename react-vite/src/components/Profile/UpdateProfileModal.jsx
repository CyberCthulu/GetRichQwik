import { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkUpdateUser } from "../../redux/users";
import "./UpdateProfileModal.css";

export default function UpdateProfileModal({ user, onClose }) {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [username, setUsername] = useState(user.username || "");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      first_name: firstName,
      last_name: lastName,
      email,
      username,
    };

    try {
      const updatedUser = await dispatch(thunkUpdateUser(user.id, formData));
      if (updatedUser) {
        onClose();
      }
    } catch (err) {
      // error handling logic
    }
  };

  return (
    <div className="update-profile-modal">
      <h2>Update Profile</h2>
      {errors.general && <p className="error">{errors.general}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="modal-actions">
          <button type="submit">Save Changes</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
