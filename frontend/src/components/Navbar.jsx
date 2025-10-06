import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white flex justify-between items-center shadow-md px-6 py-3">
      {/* Logo */}
      <Link
        to="/dashboard"
        className="text-xl font-bold hover:text-gray-300 transition"
      >
        SafetySnap
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="hover:bg-gray-800 px-4 py-2 rounded transition"
            >
              Dashboard
            </Link>
            <Link
              to="/analytics"
              className="hover:bg-gray-800 px-4 py-2 rounded transition"
            >
              Analytics
            </Link>
            <Link
              to="/upload"
              className="hover:bg-gray-800 px-4 py-2 rounded transition"
            >
              Upload
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hover:bg-gray-800 px-4 py-2 rounded transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="hover:bg-gray-800 px-4 py-2 rounded transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
