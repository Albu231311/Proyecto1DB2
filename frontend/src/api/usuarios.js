import client from './client';

export const getUsuarios = (page = 1, limit = 100) =>
  client.get(`/usuarios?page=${page}&limit=${limit}`);