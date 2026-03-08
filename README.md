# Sistema de Gestión de Restaurantes - Proyecto BD2

Este proyecto es una plataforma integral para la gestión de pedidos, reseñas y administración de restaurantes, desarrollada con **Node.js, Express y MongoDB Atlas**. Cumple con todos los requisitos de la Fase 2, incluyendo el manejo de datos masivos, archivos binarios y agregaciones complejas.

---

## Requisitos para Correr el Sistema

### 1. Entorno de Ejecución
- **Node.js:** Versión v20.20.0 o superior.
- **npm:** Gestor de paquetes incluido con Node.js.
- **Base de Datos:** Acceso a un clúster de **MongoDB Atlas** con privilegios para crear colecciones y buckets de GridFS.

### 2. Configuración de Variables de Entorno

Cree un archivo `.env` dentro de la carpeta `/backend` con los siguientes parámetros:

```env
MONGO_URI=tu_cadena_de_conexion_de_atlas
PORT=5000
```

### 3. Archivos de Prueba

- Debe existir un archivo llamado `test.jpg` en la raíz de la carpeta `/backend` para realizar las pruebas de subida a GridFS.

---


## Instalación

**1. Clonar el repositorio:**
```bash
git clone https://github.com/Albu231311/Proyecto1DB2.git
```

**2. Instalar dependencias:**
```bash
cd backend && npm install
cd ../frontend && npm install
```

**3. Iniciar el sistema:**
```bash
npm run dev
```

---

## Autores

Desarrollado por **Camila Richter 23183, Marinés García 23391 y Carlos Alburez 231311** 
