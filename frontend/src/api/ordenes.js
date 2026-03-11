import client from './client';

// GET
export const getOrdenes = async (page = 1, limit = 10) => {
  const res = await client.get(`/ordenes?page=${page}&limit=${limit}`);
  return res.data;
};

// GET 
export const getOrdenById = async (id) => {
  const res = await client.get(`/ordenes/${id}`);
  return res.data;
};

// POST 
export const crearOrden = async (body) => {
  const res = await client.post('/ordenes', body);
  return res.data;
};

// PUT 
export const updateOrden = async (id, body) => {
  const res = await client.put(`/ordenes/${id}`, body);
  return res.data;
};

// DELETE 
export const deleteOrden = async (id) => {
  const res = await client.delete(`/ordenes/${id}`);
  return res.data;
};