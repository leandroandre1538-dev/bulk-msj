import { z } from "zod";

// Aquí se pueden cambiar los mensajes de error a mostrar en el frontend (personalizarlos)
export const registerSchema = z.object({
    firstName: z.string({
        required_error: "Nombres requeridos",
    }),
    lastName: z.string({
        required_error: "Apellidos requeridos",
    }),
    username: z.string({
        required_error: "Nombre de usuario requerido",
    }),
    email: z.string({
        required_error: "Correo requerido",
    }).email({
        message: "Correo inválido",
    }),
    password: z.string({
        required_error: "Contraseña requerida",
    }).min(6, {
        message: "La contraseña debe tener al menos 6 caracteres",
    })
});

export const loginSchema = z.object({
    email: z.string({
        required_error: "Correo requerido",
    }).email({
        message: "Correo invalido",
    }),
    password: z.string({
        required_error: "Contraseña requerida",
    }).min(6, {
        message: "La contraseña debe tener al menos 6 caracteres",
    })
});