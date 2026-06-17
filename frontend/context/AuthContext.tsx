'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, AuthResponse, clearToken, getToken, setToken } from '@/lib/api';

type AuthState = {
  user: AuthResponse['user'] | null;
  role: string | null;
  verificationStatus: string | null;
  token: string | null;
  loading: boolean;
  ready: boolean;
};

const defaultState: AuthState = {
  user: null,
  role: null,
  verificationStatus: null,
  token: null,
  loading: false,
  ready: false,
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<AuthResponse>;
  registerCustomer: (data: Parameters<typeof authApi.registerCustomer>[0]) => Promise<AuthResponse>;
  registerAgent: (data: Parameters<typeof authApi.registerAgent>[0]) => Promise<AuthResponse>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: { email: string; otp: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  logout: () => void;
  setAuth: (res: AuthResponse) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  const setAuth = useCallback((res: AuthResponse) => {
    setToken(res.accessToken);
    setState({
      user: res.user,
      role: res.role,
      verificationStatus: res.verificationStatus ?? null,
      token: res.accessToken,
      loading: false,
      ready: true,
    });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState({ ...defaultState, ready: true });
  }, []);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setState((s) => ({ ...s, ready: true }));
      return;
    }
    try {
      const res = await authApi.me(token);
      setAuth(res);
    } catch {
      clearToken();
      setState((s) => ({ ...s, ready: true }));
    }
  }, [setAuth]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await authApi.login({ email, password });
      setAuth(res);
      return res;
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [setAuth]);

  const registerCustomer = useCallback(async (data: Parameters<typeof authApi.registerCustomer>[0]) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await authApi.registerCustomer(data);
      setAuth(res);
      return res;
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [setAuth]);

  const registerAgent = useCallback(async (data: Parameters<typeof authApi.registerAgent>[0]) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await authApi.registerAgent(data);
      setAuth(res);
      return res;
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [setAuth]);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    await authApi.verifyEmail({ email, otp });
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await authApi.forgotPassword({ email });
  }, []);

  const resetPassword = useCallback(async (data: { email: string; otp: string; newPassword: string; confirmPassword: string }) => {
    await authApi.resetPassword(data);
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    registerCustomer,
    registerAgent,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout,
    setAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
