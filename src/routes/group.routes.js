import { Router } from 'express';
import {
    createGroup,
    getAllGroups,
    getGroup,
    updateGroup,
    deleteGroup
} from '../controllers/group.controller.js';
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

// Rutas para CRUD de grupos

router.post('/groups', authRequired, createGroup);  // Crear un nuevo grupo
router.get('/groups', authRequired, getAllGroups);  // Obtener todos los grupos del usuario autenticado
router.get('/groups/:id', authRequired, getGroup);  // Obtener un grupo por su ID del usuario autenticado
router.put('/groups/:id', authRequired, updateGroup);  // Actualizar un grupo por su ID del usuario autenticado
router.delete('/groups/:id', authRequired, deleteGroup);  // Eliminar un grupo por su ID del usuario autenticado

export default router;
