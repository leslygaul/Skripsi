'use client';

import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  peran?: string;
  email?: string;
  nama?: string;
}

interface AuthState {
  token: string | null;
  userRole: string | null;
  userEmail: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => {
  // Jangan akses localStorage saat SSR
  if (typeof window === 'undefined') {
    return {
      token: null,
      userRole: null,
      userEmail: null,
      userName: null,
      isAuthenticated: false,
      login: () => { },
      logout: () => { },
    };
  }

  const storedToken = localStorage.getItem('token');
  let decoded: DecodedToken = {};

  if (storedToken) {
    try {
      decoded = jwtDecode<DecodedToken>(storedToken);
    } catch (err) {
      console.warn('Token tidak valid, logout otomatis');
      localStorage.removeItem('token');
    }
  }

  return {
    token: storedToken,
    userRole: decoded.peran || null,
    userEmail: decoded.email || null,
    userName: decoded.nama || null,
    isAuthenticated: !!storedToken,
    login: (token) => {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        localStorage.setItem('token', token);

        set({
          token,
          isAuthenticated: true,
          userRole: decodedToken.peran || null,
          userEmail: decodedToken.email || null,
          userName: decodedToken.nama || null,
        });
      } catch (error) {
        console.error('Gagal decode token:', error);
        set({
          token: null,
          isAuthenticated: false,
          userRole: null,
          userEmail: null,
          userName: null,
        });
      }
    },
    logout: () => {
      localStorage.removeItem('token');
      set({
        token: null,
        isAuthenticated: false,
        userRole: null,
        userEmail: null,
        userName: null,
      });
    },
  };
});

export default useAuthStore;
