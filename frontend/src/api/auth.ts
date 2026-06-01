import api from './client';

export const register = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post('/auth/register', data);

export const login = (data: {
  email: string;
  password: string;
}) => api.post('/auth/login', data);

export const logout = () => api.post('/auth/logout');
