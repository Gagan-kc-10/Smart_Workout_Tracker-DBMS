
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getRoleHome(roleName) {
  switch (roleName) {
    case "Admin":
      return "/admin";
    case "Trainer":
      return "/trainer";
    case "User":
      return "/";
    default:
      return "/login";
  }
}

function ProtectedRoute({ allowedRoles }) {
  const { token, user } = useAuth();

  // Check authentication
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check authorization
  if (
    allowedRoles &&
    !allowedRoles.includes(user.Role_Name)
  ) {
    return (
      <Navigate
        to={getRoleHome(user.Role_Name)}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
