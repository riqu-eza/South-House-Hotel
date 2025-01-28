import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLogin from "./Adminlogin";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // On mount, check localStorage
    const storedAuth = localStorage.getItem("adminAuth");
    if (storedAuth) {
      const { authorized, timestamp } = JSON.parse(storedAuth);
      if (authorized && !isExpired(timestamp)) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    // Called when user enters correct password
    localStorage.setItem(
      "adminAuth",
      JSON.stringify({ authorized: true, timestamp: Date.now() })
    );
    setIsAuthenticated(true);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      {isAuthenticated ? (
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-center">Admin Dashboard</h1>
          <p className="text-gray-600 mb-6 text-center">
            Welcome to your admin control panel. Choose an action:
          </p>

          <div className="grid gap-3">
            <Link
              to="/create"
              className="text-white bg-green-500 px-4 py-2 rounded-md font-semibold text-center hover:bg-green-600 transition duration-200"
            >
              Create Listing
            </Link>
            <Link
              to="/book-date"
              className="text-white bg-blue-500 px-4 py-2 rounded-md font-semibold text-center hover:bg-blue-600 transition duration-200"
            >
              Add Book Date
            </Link>
            <Link
              to="/viewbookings"
              className="text-white bg-purple-500 px-4 py-2 rounded-md font-semibold text-center hover:bg-purple-600 transition duration-200"
            >
              View Bookings
            </Link>
            <Link
              to="/viewlistings"
              className="text-white bg-indigo-500 px-4 py-2 rounded-md font-semibold text-center hover:bg-indigo-600 transition duration-200"
            >
              Manage Listing
            </Link>
            <Link
              to="/viewsite"
              className="text-white bg-indigo-500 px-4 py-2 rounded-md font-semibold text-center hover:bg-indigo-600 transition duration-200"
            >
              Manage Site
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <AdminLogin onSuccess={handleLoginSuccess} />
        </div>
      )}
    </div>
  );
};

// A helper function to check if more than 24 hours has passed
function isExpired(timestamp) {
  const oneDay = 24 * 60 * 60 * 1000; // 24 hours in ms
  const now = Date.now();
  return now - timestamp > oneDay;
}

export default Admin;
