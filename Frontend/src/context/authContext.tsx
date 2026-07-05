import {
    createContext,
    useContext,
    useState,
    useEffect,
  } from "react";
import type { ReactNode } from "react";
  type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: "company" | "candidate";
    token: string;
  };
  
  type AuthContextType = {
    user: AuthUser | null;
    login: (user: AuthUser) => void;
    logout: () => void;
    isLoading: boolean;
  };
  
  const AuthContext = createContext<AuthContextType | null>(null);
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem("auth_user");
        }
      }
      setIsLoading(false);
    }, []);
  
    function login(userData: AuthUser) {
      setUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(userData));
    }
  
    function logout() {
      setUser(null);
      localStorage.removeItem("auth_user");
    }
  
    return (
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
  }


// NOTE: localStorage is used here for simplicity in development.
// In production, tokens should be stored in httpOnly cookies to
// prevent XSS attacks. The backend would set the cookie via
// Set-Cookie header and the frontend would use credentials: "include".