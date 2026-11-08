import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { createExecution, getExecutions, getExecution, finishExecution } from '../controllers/execution.controller.js';

const router = Router();

router.get('/executions', authRequired, getExecutions);          // Historial de envíos
router.post('/executions', authRequired, createExecution);       // Inicia un envío
router.get('/executions/:id', authRequired, getExecution);       // Detalle con resultado por número
router.patch('/executions/:id/finish', authRequired, finishExecution); // Marca el envío como terminado

export default router;
