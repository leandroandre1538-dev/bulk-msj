import { z } from "zod";

export const createGroupSchema = z.object({
    groupName: z.string().min(1, { message: "El nombre del grupo es requerido" }),
    description: z.string().min(1, { message: "La descripción del grupo es requerida" }),
});