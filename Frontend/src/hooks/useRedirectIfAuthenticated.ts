import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { dashboardPath } from "../services/auth";

export function useRedirectIfAuthenticated() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) navigate(dashboardPath(user.role));
  }, [user, isLoading, navigate]);
}
