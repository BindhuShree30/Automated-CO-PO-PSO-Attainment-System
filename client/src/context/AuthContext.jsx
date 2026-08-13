import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * ---------------------------------------------------------
   * Restore Existing Session
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedUser = localStorage.getItem("user");
        const accessToken = localStorage.getItem("access");

        if (savedUser && accessToken) {
          const parsedUser = JSON.parse(savedUser);

          if (parsedUser && parsedUser.role) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem("user");
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Error restoring authentication session:",
          error
        );

        localStorage.removeItem("user");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("token");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * ---------------------------------------------------------
   * Login
   * ---------------------------------------------------------
   */
  const login = async (credentials) => {
    const response = await authService.login(
      credentials
    );

    console.log("LOGIN RESPONSE:", response);

    const accessToken =
      response.data?.access ||
      response.data?.accessToken ||
      response.data?.token;

    const refreshToken =
      response.data?.refresh ||
      response.data?.refreshToken ||
      null;

    const loggedInUser =
      response.data?.user;

    if (!accessToken || !loggedInUser) {
      throw new Error(
        "Invalid authentication response from server."
      );
    }

    /**
     * Store access token
     */
    localStorage.setItem(
      "access",
      accessToken
    );

    /**
     * Store refresh token if backend provides one
     */
    if (refreshToken) {
      localStorage.setItem(
        "refresh",
        refreshToken
      );
    } else {
      localStorage.removeItem("refresh");
    }

    /**
     * Store user
     */
    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    /**
     * Remove old authentication key
     */
    localStorage.removeItem("token");

    setUser(loggedInUser);

    return loggedInUser;
  };

  /**
   * ---------------------------------------------------------
   * Logout
   * ---------------------------------------------------------
   */
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
  };

  /**
   * ---------------------------------------------------------
   * Context Provider
   * ---------------------------------------------------------
   */
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * ---------------------------------------------------------
 * useAuth Hook
 * ---------------------------------------------------------
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}

export default AuthContext;