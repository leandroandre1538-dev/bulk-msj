// La configuración se lee de variables de entorno (.env en local, panel de Vercel en producción).
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.TOKEN_SECRET && isProduction) {
    throw new Error("Falta la variable de entorno TOKEN_SECRET");
}

export const TOKEN_SECRET = process.env.TOKEN_SECRET || "dev-only-secret-cambiar";

// Versión de la Graph API de Meta. Las versiones caducan ~2 años después de publicarse.
export const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || "v23.0";

export const COOKIE_OPTIONS = {
    sameSite: "lax",
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000
};
