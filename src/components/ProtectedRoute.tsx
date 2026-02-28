import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const verifiedEmail = sessionStorage.getItem("verified_email");

  if (!verifiedEmail) {
    return <Navigate to="/verificar" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
