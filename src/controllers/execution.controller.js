import mongoose from 'mongoose';
import Execution from '../models/execution.model.js';
import Group from '../models/group.model.js';

const isId = (id) => mongoose.isValidObjectId(id);

const countResults = (results) => ({
    successCount: results.filter((r) => r.state === 'success').length,
    failedCount: results.filter((r) => r.state !== 'success').length
});

const sanitizeResults = (results) =>
    (Array.isArray(results) ? results : []).map((r) => ({
        phone: String(r?.phone ?? ''),
        state: r?.state === 'success' ? 'success' : 'warning',
        description: String(r?.description ?? '')
    }));

// Agrega resultados a una ejecución del usuario. Lo usa también el envío de mensajes.
export const appendExecutionResults = async (executionId, userId, results) => {
    if (!isId(executionId) || results.length === 0) return;
    const { successCount, failedCount } = countResults(results);
    await Execution.updateOne(
        { _id: executionId, userId },
        { $push: { results: { $each: results } }, $inc: { successCount, failedCount } }
    );
};

export const createExecution = async (req, res) => {
    const { templateName, templateLanguage, groupId, total } = req.body;
    if (!templateName) {
        return res.status(400).json({ message: 'templateName es requerido' });
    }

    try {
        const group = isId(groupId) ? await Group.findOne({ _id: groupId, userId: req.user.id }) : null;
        const execution = await Execution.create({
            userId: req.user.id,
            templateName,
            templateLanguage,
            groupId: group?._id,
            groupName: group?.groupName,
            total: Number(total) || 0
        });
        res.status(201).json({ _id: execution._id });
    } catch (error) {
        console.error('Error al crear la ejecución:', error);
        res.status(500).json({ message: 'No se pudo registrar el envío' });
    }
};

// Lista sin el detalle por número (puede ser grande)
export const getExecutions = async (req, res) => {
    try {
        const executions = await Execution.find({ userId: req.user.id }, { results: 0 })
            .sort({ createdAt: -1 })
            .limit(200);
        res.json(executions);
    } catch (error) {
        res.status(500).json({ message: 'No se pudo obtener el historial' });
    }
};

export const getExecution = async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ message: 'Envío no encontrado' });
    try {
        const execution = await Execution.findOne({ _id: req.params.id, userId: req.user.id });
        if (!execution) return res.status(404).json({ message: 'Envío no encontrado' });
        res.json(execution);
    } catch (error) {
        res.status(500).json({ message: 'No se pudo obtener el envío' });
    }
};

// Marca la ejecución como terminada. Acepta resultados de lotes que fallaron
// antes de llegar al servidor (por ejemplo, un corte de red) para que el historial cuadre.
export const finishExecution = async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ message: 'Envío no encontrado' });
    try {
        const extra = sanitizeResults(req.body?.extraResults);
        await appendExecutionResults(req.params.id, req.user.id, extra);
        const execution = await Execution.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { status: 'completed', finishedAt: new Date() },
            { new: true, projection: { results: 0 } }
        );
        if (!execution) return res.status(404).json({ message: 'Envío no encontrado' });
        res.json(execution);
    } catch (error) {
        console.error('Error al finalizar la ejecución:', error);
        res.status(500).json({ message: 'No se pudo finalizar el envío' });
    }
};
