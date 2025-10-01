import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AuthedUser = {
  email: string;
  name?: string;
};

type AuthContextValue = {
  user: AuthedUser | null;
  signIn: (email: string, name?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = "excellytics_auth_user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthedUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const signIn = (email: string, name?: string) => {
    const display = name || (email.includes("@") ? email.split("@")[0] : email);
    setUser({ email, name: display });
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({ user, signIn, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
