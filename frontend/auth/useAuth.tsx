'use client';
import { useAtom } from 'jotai';
import { useState } from 'react';
import api from '../src/lib/apiClient';
import { authTokenManager } from '@/src/lib/tokenManager';
import { accessTokenAtom, userAtom } from '@/src/atoms/authAtom';
import { useToast } from '@/src/components/ToastProvider';

export function useAuth() {
  const [, setToken] = useAtom(accessTokenAtom);
  const [, setUser] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, user } = res.data;
      authTokenManager.setToken(accessToken);
      setToken(accessToken);
      setUser(user);
      return user;
    } catch (error) {
      showToast({ type: 'error', title: 'Error', description: `${error}` });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { email: string; password: string; name?: string }) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/register', payload);
      const { accessToken, user } = res.data;
      authTokenManager.setToken(accessToken);
      setToken(accessToken);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.post('/auth/logout'); 
    } catch (err) {
      // Handle error if needed
    } finally {
      authTokenManager.clearToken();
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/refresh');
      const { accessToken, user } = res.data;
      authTokenManager.setToken(accessToken);
      setToken(accessToken);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, register, logout, refresh, isLoading };
}