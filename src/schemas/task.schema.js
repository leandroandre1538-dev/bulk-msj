import { z } from "zod";

export const createTaskSchema = z.object({
    title: z.string({
        required_error: "Título requerido",
    }),
    description: z.string({
        required_error: "La descripción debe ser una cadena de texto",
    }).optional(),
    date: z.string().datetime().optional()
});