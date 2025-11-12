let token: string | null = null;

export const authTokenManager = {
  getToken: () => token,
  setToken: (t: string | null) => { token = t; },
  clearToken: () => { token = null; },
};