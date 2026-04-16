import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const rawRole = localStorage.getItem("role") || "";
  
  // Normalize roles by stripping "ROLE_" prefix if it exists
  const role = rawRole.startsWith("ROLE_") ? rawRole.replace("ROLE_", "") : rawRole;
  const expectedRole = allowedRole?.startsWith("ROLE_") ? allowedRole.replace("ROLE_", "") : allowedRole;

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (expectedRole && role !== expectedRole) {
    return <Navigate to="/login" />;
  }

  return children;
}