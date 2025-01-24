/* eslint-disable react/prop-types */
import { useState } from "react";

const CORRECT_PASSWORD = "yourSecret123"; // store in .env for better security

const AdminLogin = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      onSuccess();
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded shadow max-w-sm mx-auto">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <input
          type="password"
          className="border w-full px-2 py-1 rounded"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-3 py-1 rounded"
        >
          Log In
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
