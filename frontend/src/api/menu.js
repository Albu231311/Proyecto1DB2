import client from './client';


export const subirImagen = (formData) => 
    client.post('/archivos/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });