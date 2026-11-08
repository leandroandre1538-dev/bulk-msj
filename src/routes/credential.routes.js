import { Router } from 'express';
import {
    createCredential,
    getAllCredentials,
    getCredentialById,
    updateCredential,
    deleteCredential,
    getCredentialsByUserId,
    getWhatsAppAccountStatus
} from '../controllers/credential.controller.js';
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validator.middlewares.js";
import { createCredentialSchema } from "../schemas/credential.schema.js";

const router = Router();

router.get('/whatsapp/status', authRequired, getWhatsAppAccountStatus); // Estado de la cuenta de WhatsApp

router.post('/credentials', authRequired, validateSchema(createCredentialSchema),  createCredential); // Crear una nueva credencial
router.get('/credentials', authRequired,  getAllCredentials); // Obtener todas las credenciales
router.get('/credentials/:id', authRequired,  getCredentialById); // Obtener una credencial por ID
router.get('/credentials/user/:userId', authRequired,  getCredentialsByUserId); // Obtener credenciales por usuario
router.put('/credentials/:id', authRequired, updateCredential); // Actualizar una credencial por ID
router.delete('/credentials/:id', authRequired, deleteCredential); // Eliminar una credencial por ID

export default router;