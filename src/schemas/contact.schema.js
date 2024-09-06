import { z } from "zod";

export const createContactSchema = z.object({
    name: z.string().min(1, { message: "El nombre es requerido" }),
    phoneNumber: z.string().min(1, { message: "El número de teléfono es requerido" }),
    variables: z.record(z.string()).optional(),
});