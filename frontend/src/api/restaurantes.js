import client from './client';

// Obtener todos con paginación 
export const getRestaurantes = (page = 1, limit = 10) => 
    client.get(`/restaurantes?page=${page}&limit=${limit}`);

// Buscar por nombre o categoría 
export const buscarRestaurantes = (termino) => 
    client.get(`/restaurantes/buscar?q=${termino}`);

// Obtener uno solo 
export const getRestauranteById = (id) => 
    client.get(`/restaurantes/${id}`);

// 1. Actualizar metadatos del restaurante 
export const updateRestaurante = (id, data) => 
    client.put(`/restaurantes/${id}`, data);

// 2. Eliminar un restaurante
export const deleteRestaurante = (id) => 
    client.delete(`/restaurantes/${id}`);

// 3. Crear un nuevo restaurante
export const crearRestaurante = (data) => 
    client.post('/restaurantes', data);