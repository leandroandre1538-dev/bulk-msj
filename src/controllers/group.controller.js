import Group from '../models/group.model.js';

// Función para crear un nuevo grupo
export const createGroup = async (req, res) => {
    try {
        const { groupName, description } = req.body;
        const userId = req.user.id;

        // Normalizar el nombre del grupo a minúsculas para la comparación
        const normalizedGroupName = groupName.trim().toLowerCase();

        // Verificar si ya existe un grupo con el mismo nombre para el usuario
        const existingGroup = await Group.findOne({
            userId: userId,
            groupName: { $regex: new RegExp(`^${normalizedGroupName}$`, 'i') }
        });

        if (existingGroup) {
            return res.status(400).json({ message: 'Ya existe un grupo con ese nombre' });
        }

        // Crear el nuevo grupo
        const newGroup = new Group({
            groupName: groupName, // Guardar el nombre tal como lo ingresó el usuario
            description,
            userId
        });

        const savedGroup = await newGroup.save();
        res.status(201).json(savedGroup);
    } catch (error) {
        console.error('Error al crear el grupo:', error);
        res.status(500).json({ message: "Error al crear el grupo" });
    }
};

// Función para obtener todos los grupos del usuario autenticado
export const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find({ userId: req.user.id });
        res.json(groups);
    } catch (error) {
        console.error('Error al obtener los grupos:', error);
        res.status(500).json({ message: "Error al obtener los grupos" });
    }
};

// Función para obtener un grupo por su ID
export const getGroup = async (req, res) => {
    try {
        const group = await Group.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!group) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }

        res.json(group);
    } catch (error) {
        console.error('Error al obtener el grupo:', error);
        res.status(500).json({ message: "Error al obtener el grupo" });
    }
};

// Función para actualizar un grupo por su ID
export const updateGroup = async (req, res) => {
    try {
        const { groupName, description } = req.body;
        const userId = req.user.id;

        // Normalizar el nombre del grupo a minúsculas para la comparación
        const normalizedGroupName = groupName.trim().toLowerCase();

        // Verificar si ya existe un grupo con el mismo nombre para el usuario, excluyendo el grupo que se está actualizando
        const existingGroup = await Group.findOne({
            _id: { $ne: req.params.id }, // No incluir el grupo que se está actualizando
            userId: userId,
            groupName: { $regex: new RegExp(`^${normalizedGroupName}$`, 'i') }
        });

        if (existingGroup) {
            return res.status(400).json({ message: 'Ya existe un grupo con ese nombre' });
        }

        // Actualizar el grupo
        const updatedGroup = await Group.findOneAndUpdate(
            { _id: req.params.id, userId: userId },
            { groupName: groupName, description },
            { new: true }
        );

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }

        res.json(updatedGroup);
    } catch (error) {
        console.error('Error al actualizar el grupo:', error);
        res.status(500).json({ message: "Error al actualizar el grupo" });
    }
};

// Función para eliminar un grupo por su ID
export const deleteGroup = async (req, res) => {
    try {
        const deletedGroup = await Group.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!deletedGroup) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }

        res.sendStatus(204);  // Operación exitosa, no es necesario devolver nada.
    } catch (error) {
        console.error('Error al eliminar el grupo:', error);
        res.status(500).json({ message: "Error al eliminar el grupo" });
    }
};