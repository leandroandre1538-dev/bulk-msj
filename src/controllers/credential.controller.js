import Credential from '../models/credential.model.js';
import User from '../models/user.model.js';

export const createCredential = async (req, res) => {
    const { wabId, phoneId, tokenAccess, userId } = req.body;

    try {
        // Verificar si el usuario existe
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(400).json({ message: 'User not found' });
        }

        const newCredential = new Credential({
            wabId,
            phoneId,
            tokenAccess,
            userId
        });

        const savedCredential = await newCredential.save();
        res.status(201).json(savedCredential);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllCredentials = async (req, res) => {
    try {
        const credential = await Credential.find().populate('userId', 'username email');
        res.json(credential);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCredentialById = async (req, res) => {
    const { id } = req.params;

    try {
        const credential = await Credential.findById(id).populate('userId', 'username email');
        if (!credential) {
            return res.status(404).json({ message: 'Credential not found' });
        }
        res.json(credential);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCredential = async (req, res) => {
    const { id } = req.params;
    const { wabId, phoneId, tokenAccess, userId } = req.body;

    try {
        // Verificar si el usuario existe
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(400).json({ message: 'User not found' });
        }

        const updatedCredential = await Credential.findByIdAndUpdate(id, {
            wabId,
            phoneId,
            tokenAccess,
            userId
        }, { new: true });

        if (!updatedCredential) {
            return res.status(404).json({ message: 'Credential not found' });
        }
        res.json(updatedCredential);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCredential = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCredential = await Credential.findByIdAndDelete(id);
        if (!deletedCredential) {
            return res.status(404).json({ message: 'Credential not found' });
        }
        res.json({ message: 'Credential deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función para buscar credenciales por el código de usuario
export const getCredentialsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const credentials = await Credential.find({ userId }).populate('userId', 'username email');
        res.json(credentials);
    } catch (error) {
        console.error(`Error fetching credentials: ${error}`);
        res.status(500).json({ message: error.message });
    }
};