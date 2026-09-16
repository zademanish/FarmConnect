import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/endpoints";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("fc_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Re-validate the stored token on first load
  useEffect(() => {
    const token = localStorage.getItem("fc_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ data }) => persist(data.data.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const persist = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("fc_user", JSON.stringify(nextUser));
  };

  const saveSession = ({ user: nextUser, token }) => {
    localStorage.setItem("fc_token", token);
    persist(nextUser);
    return nextUser;
  };

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    return saveSession(data.data);
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return saveSession(data.data);
  };

  const logout = () => {
    localStorage.removeItem("fc_token");
    localStorage.removeItem("fc_user");
    setUser(null);
  };

  // Where each role lands after logging in
  const homeFor = (role) =>
    role === "admin" ? "/admin/dashboard" : role === "farmer" ? "/farmer/dashboard" : "/";

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser: persist, homeFor }}
    >
      {children}
    </AuthContext.Provider>
  );
};
