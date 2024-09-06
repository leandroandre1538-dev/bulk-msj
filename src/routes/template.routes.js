import { Router } from "express";
import { authRequired } from '../middlewares/validateToken.js';
import { getTemplates, sendMessagesByTemplateAndListContacts } from "../controllers/template.controller.js";

const router = Router();

// Define la ruta para obtener las plantillas
router.get('/getTemplates', authRequired, getTemplates);
router.post('/sendMessages', authRequired, sendMessagesByTemplateAndListContacts);

export default router;