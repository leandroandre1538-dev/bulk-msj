import Credential from '../models/credential.model.js';
import { getWhatsAppStatus, maskToken } from '../libs/whatsappStatus.js';

// Todas las operaciones se limitan a las credenciales del usuario autenticado (req.user.id).
// El userId que pueda venir en el body o en la URL se ignora.

const clean = (value) => (typeof value === 'string' ? value.trim() : value);

// Crear (o actualizar si ya existe: un usuario tiene una sola credencial de WhatsApp)
export const createCredential = async (req, res) => {
    const { wabId, phoneId, tokenAccess } = req.body;

    try {
        const credential = await Credential.findOneAndUpdate(
            { userId: req.user.id },
            { wabId: clean(wabId), phoneId: clean(phoneId), tokenAccess: clean(tokenAccess), userId: req.user.id },
            { new: true, upsert: true, runValidators: true }
        );
        res.status(201).json(credential);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllCredentials = async (req, res) => {
    try {
        const credentials = await Credential.find({ userId: req.user.id });
        res.json(credentials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCredentialById = async (req, res) => {
    try {
        const credential = await Credential.findOne({ _id: req.params.id, userId: req.user.id });
        if (!credential) {
            return res.status(404).json({ message: 'Credential not found' });
        }
        res.json(credential);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCredential = async (req, res) => {
    const { wabId, phoneId, tokenAccess } = req.body;

    try {
        const updatedCredential = await Credential.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { wabId: clean(wabId), phoneId: clean(phoneId), tokenAccess: clean(tokenAccess) },
            { new: true, runValidators: true }
        );

        if (!updatedCredential) {
            return res.status(404).json({ message: 'Credential not found' });
        }
        res.json(updatedCredential);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCredential = async (req, res) => {
    try {
        const deletedCredential = await Credential.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedCredential) {
            return res.status(404).json({ message: 'Credential not found' });
        }
        res.json({ message: 'Credential deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Estado de la cuenta de WhatsApp según las credenciales guardadas (para la página de Perfil).
// Nunca devuelve el token completo.
export const getWhatsAppAccountStatus = async (req, res) => {
    try {
        const credential = await Credential.findOne({ userId: req.user.id });
        if (!credential) {
            return res.json({ configured: false });
        }

        const status = await getWhatsAppStatus(credential);
        res.json({
            configured: true,
            credential: {
                wabId: credential.wabId,
                phoneId: credential.phoneId,
                tokenPreview: maskToken(credential.tokenAccess),
                updatedAt: credential.updatedAt
            },
            ...status
        });
    } catch (error) {
        console.error('Error al consultar el estado de WhatsApp:', error);
        res.status(500).json({ message: 'No se pudo consultar el estado de la cuenta de WhatsApp' });
    }
};

// Se mantiene la ruta /credentials/user/:userId por compatibilidad con el frontend,
// pero solo devuelve las credenciales del usuario autenticado.
export const getCredentialsByUserId = async (req, res) => {
    if (req.params.userId !== String(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const credentials = await Credential.find({ userId: req.user.id });
        res.json(credentials);
    } catch (error) {
        console.error(`Error fetching credentials: ${error}`);
        res.status(500).json({ message: error.message });
    }
};
