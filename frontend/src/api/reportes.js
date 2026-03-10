import client from "./client";

export const getTopRestaurantes = async () => await client.get("/restaurantes/top");
export const getClientesRecurrentes = async () => await client.get("/ordenes/reporte/clientes-recurrentes");
export const getPlatillosTop = async () => await client.get("/ordenes/reporte/platillos-top");


export const getRestaurantesCercanos = async (lng, lat) => {
    
    return await client.get(`/restaurantes/cercanos`, {
        params: { lng, lat }
    });
};