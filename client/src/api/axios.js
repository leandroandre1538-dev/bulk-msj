import axios from 'axios'

// Por defecto la API está en el mismo dominio (/api): en local lo resuelve el proxy de Vite
// y en Vercel el rewrite de vercel.json. VITE_API_URL solo si la API está en otro dominio.
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true
});

export default instance;
