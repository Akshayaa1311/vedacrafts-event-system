import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  const isLoggedIn =
    localStorage.getItem("adminLoggedIn");

  return isLoggedIn
    ? children
    : <Navigate to="/admin-login" />;
}

export default ProtectedRoute;