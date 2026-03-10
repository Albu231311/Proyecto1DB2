import client from "./client";


export const subirImagenPrueba = async () => {
    return await client.post("/archivos/upload");
};


export const getUrlImagen = (id) => {
    
    return `${client.defaults.baseURL}/archivos/ver/${id}`;
};