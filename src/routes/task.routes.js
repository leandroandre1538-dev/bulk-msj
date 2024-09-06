import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { getTasks, getTask, createTask, deleteTask, updateTask } from '../controllers/tasks.controller.js';
import { validateSchema } from "../middlewares/validator.middlewares.js";
import { createTaskSchema } from '../schemas/task.schema.js';

const router = Router();

// Esta ruta debe ser cambiada a la de venta_bot por ejemplo.
// Valida y no deja ingresar si no estas registrado.
// Procedimientos CRUD a los que solo accedes si has iniciado sesión en la página.
router.get('/tasks', authRequired, getTasks);
router.get('/tasks/:id', authRequired, getTask);
router.post('/tasks', authRequired, validateSchema(createTaskSchema), createTask);
router.delete('/tasks/:id', authRequired, deleteTask);
router.put('/tasks/:id', authRequired, updateTask);

export default router;