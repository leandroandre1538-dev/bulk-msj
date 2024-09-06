import { z } from "zod";

export const createCredentialSchema = z.object({
    wabId: z.string({
        required_error: "wabId es requerido",
    }),
    phoneId: z.string({
        required_error: "phoneId es requerido",
    }),
    tokenAccess: z.string({
        required_error: "tokenAccess es requerido",
    }),
});