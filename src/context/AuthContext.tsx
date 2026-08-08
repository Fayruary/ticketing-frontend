"use client";

import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getUser,
  getToken,
  saveAuth,
  logout as logoutStorage,
  type User,
} from "../lib/auth";

import {
  loginUser,
  type LoginResponse,
} from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: User["role"] | null;
  login: (
    email: string,
    password: string
  ) => Promise<LoginResponse>;
  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const savedUser = getUser();
    const savedToken = getToken();

    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  async function login(
    email: string,
    password: string
  ) {
    const response = await loginUser({
      email,
      password,
    });

    saveAuth(
      response.token,
      response.user
    );

    setToken(response.token);
    setUser(response.user);

    return response;
  }

  function logout() {
    logoutStorage();

    setToken(null);
    setUser(null);
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    role: user?.role || null,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}