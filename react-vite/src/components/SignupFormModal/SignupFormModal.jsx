// src/components/SignupFormModal.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { thunkSignup } from "../../redux/session";
import "./SignupForm.css";

function SignupFormModal() {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});

  const newErrors = {};

  if (password !== confirmPassword) {
    newErrors.confirmPassword = "Confirm Password field must be the same as the Password field";
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    // Proceeding with the backend validation still makes sense here to get all possible errors
  }

  const serverResponse = await dispatch(
    thunkSignup({
      first_name: firstName,
      last_name: lastName,
      email,
      username,
      password,
      confirm_password: confirmPassword,
    })
  );

  if (serverResponse && serverResponse.errors) {
    // Merge backend errors with frontend errors
    setErrors(prevErrors => ({ ...prevErrors, ...serverResponse.errors }));
  } else if (serverResponse?.server) {
    setErrors({ server: serverResponse.server });
  } else {
    closeModal();
  }
};

  

  return (
<>
  <h1>Sign Up</h1>
  {errors.server && <p className="error-message">{errors.server}</p>}
  <form onSubmit={handleSubmit} className="signup-form-container">
    <label>
      First Name
      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      {errors.first_name && <p className="error-message">{errors.first_name}</p>}
    </label>

    <label>
      Last Name
      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      {errors.last_name && <p className="error-message">{errors.last_name}</p>}
    </label>

    <label>
      Email
      <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
      {errors.email && <p className="error-message">{errors.email}</p>}
    </label>

    <label>
      Username
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      {errors.username && <p className="error-message">{errors.username}</p>}
    </label>

    <label>
      Password
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {errors.password && <p className="error-message">{errors.password}</p>}
    </label>

    <label>
      Confirm Password
      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
    </label>

    <button type="submit">Sign Up</button>
  </form>

    </>
  );
}

export default SignupFormModal;
