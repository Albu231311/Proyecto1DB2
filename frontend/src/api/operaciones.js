import client from "./client";

// Basado en tu router de usuarios (se asume que la ruta masiva es /usuarios/invitados)
export const eliminarInvitados = async () => {
    return await client.delete("/usuarios/invitados"); 
};

// Basado en tu router de menú: router.put('/update-precios', ...)
export const actualizarPreciosCategoria = async (categoria, incremento) => {
    return await client.put("/menu/update-precios", { 
        categoria: categoria, 
        incremento: incremento 
    });
};