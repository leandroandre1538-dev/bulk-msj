import { Router } from 'express';
import {
    createContact,
    getAllContacts,
    getContact,
    updateContact,
    deleteContact,
    getContactsByGroup,
    createContactsForExcel
} from '../controllers/contact.controller.js';
import { authRequired } from "../middlewares/validateToken.js";
import multer from 'multer';

// Configuración de multer para manejo de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 4 * 1024 * 1024 } }); // Vercel limita el body a ~4.5 MB

const router = Router();

// Rutas para CRUD de contactos

router.post('/contacts', authRequired, createContact);  // Crear un nuevo contacto
router.get('/contacts', authRequired, getAllContacts);  // Obtener todos los contactos del usuario autenticado
router.get('/contacts/:id', authRequired, getContact);  // Obtener un contacto por ID del usuario autenticado
router.put('/contacts/:id', authRequired, updateContact);  // Actualizar un contacto por ID del usuario autenticado
router.delete('/contacts/:id', authRequired, deleteContact);  // Eliminar un contacto por ID del usuario autenticado

// Rutas para operaciones específicas por grupo

router.get('/contacts/group/:group', authRequired, getContactsByGroup);  // Obtener contactos por grupo del usuario autenticado

// Ruta para importar contactos desde Excel
router.post('/contacts/import', authRequired, upload.single('file'), createContactsForExcel);

export default router;