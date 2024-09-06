import Contact from '../models/contact.model.js';
import Group from '../models/group.model.js';
import XLSX from 'xlsx';

// Obtener todos los contactos del usuario autenticado
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find({ userId: req.user.id })
            .populate('userId', 'username email')
            .populate('group', 'groupName description');

        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching contacts" });
    }
};

// Obtener un contacto por ID del usuario autenticado
export const getContact = async (req, res) => {
    try {
        const contact = await Contact.findOne({
            _id: req.params.id,
            userId: req.user.id
        }).populate('userId', 'username email')
            .populate('group', 'groupName description');

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: "Error fetching contact" });
    }
};

// Crear un nuevo contacto para el usuario autenticado
export const createContact = async (req, res) => {
    try {
        const { name, phoneNumber, groupId, variables } = req.body;

        // Verificar si el grupo existe y pertenece al usuario autenticado
        const group = await Group.findOne({ _id: groupId, userId: req.user.id });
        if (!group) {
            return res.status(400).json({ message: "Group not found or unauthorized" });
        }

        // Verificar si ya existe un contacto con el mismo número y grupo
        const existingContact = await Contact.findOne({
            phoneNumber,
            group: groupId,
            userId: req.user.id
        });

        if (existingContact) {
            console.log(`Contacto con número ${phoneNumber} ya existe en el grupo ${groupId}`);
            return res.status(409).json({ message: "Contact already exists in the group" });
        }

        const newContact = new Contact({
            name,
            phoneNumber,
            group: groupId,
            userId: req.user.id,
            variables
        });

        const savedContact = await newContact.save();
        res.status(201).json(savedContact);
    } catch (error) {
        console.error("Error creating contact:", error);
        res.status(500).json({ message: "Error creating contact" });
    }
};

// Actualizar un contacto por ID del usuario autenticado
export const updateContact = async (req, res) => {
    try {
        const { name, phoneNumber, groupId, variables } = req.body;

        // Verificar si el grupo existe y pertenece al usuario autenticado
        const group = await Group.findOne({ _id: groupId, userId: req.user.id });
        if (!group) {
            return res.status(400).json({ message: "Group not found or unauthorized" });
        }

        // Verificar si ya existe un contacto con el mismo número y grupo, excluyendo el contacto que se está actualizando
        const existingContact = await Contact.findOne({
            phoneNumber,
            group: groupId,
            userId: req.user.id,
            _id: { $ne: req.params.id } // Excluir el contacto actual que se está actualizando
        });

        if (existingContact) {
            console.log(`Contacto con número ${phoneNumber} ya existe en el grupo ${groupId}`);
            return res.status(409).json({ message: "Contact already exists in the group" });
        }

        // Actualizar el contacto
        const contact = await Contact.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { name, phoneNumber, group: groupId, variables },
            { new: true } // Devuelve el documento actualizado
        ).populate('userId', 'username email')
            .populate('group', 'groupName description');

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.json(contact);
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ message: "Error updating contact" });
    }
};

// Eliminar un contacto por ID del usuario autenticado
export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.sendStatus(204); // Operación exitosa, no es necesario devolver nada.
    } catch (error) {
        res.status(500).json({ message: "Error deleting contact" });
    }
};

// Obtener todos los contactos por grupo del usuario autenticado
export const getContactsByGroup = async (req, res) => {
    try {
        // Buscar el grupo para asegurarnos de que exista y pertenezca al usuario
        const group = await Group.findOne({
            _id: req.params.group,
            userId: req.user.id
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found or unauthorized' });
        }

        // Obtener todos los contactos del grupo especificado
        const contacts = await Contact.find({
            userId: req.user.id,
            group: req.params.group
        }).populate('userId', 'username email');

        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching contacts by group" });
    }
};


// Función para crear nuevos contactos desde Excel para un grupo específico
export const createContactsForExcel = async (req, res) => {
    try {
        const { groupId } = req.body;
        const file = req.file;

        // Verificar si el grupo existe y pertenece al usuario autenticado
        const group = await Group.findOne({ _id: groupId, userId: req.user.id });
        if (!group) {
            return res.status(400).json({ message: "Group not found or unauthorized" });
        }

        // Leer el archivo Excel desde el buffer
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rows.length <= 1) {
            return res.status(400).json({ message: "El archivo está vacío o no tiene datos válidos" });
        }

        // Obtener encabezados
        const headers = rows[0];
        const dataRows = rows.slice(1); // Excluir los encabezados

        // Procesar cada fila del archivo Excel
        const newContacts = [];
        for (const dataRow of dataRows) {
            const contactData = {};

            headers.forEach((header, index) => {
                const value = dataRow[index];
                
                // Asignar el valor a la clave correspondiente
                if (header.toUpperCase() === 'NOMBRE') {
                    contactData.name = value;
                } else if (header.toUpperCase() === 'NÚMERO') {
                    contactData.phoneNumber = value;
                } else {
                    // Agregar otras variables al campo 'variables'
                    contactData.variables = contactData.variables || {};
                    contactData.variables[header.toUpperCase()] = value;
                }
            });

            const { name, phoneNumber, variables } = contactData;

            // Verificar si ya existe un contacto con el mismo número y grupo
            const existingContact = await Contact.findOne({
                phoneNumber,
                group: groupId,
                userId: req.user.id
            });

            if (existingContact) {
                console.log(`Contacto con número ${phoneNumber} ya existe en el grupo ${groupId}`);
                continue; // Saltar si ya existe
            }

            // Crear un nuevo contacto
            const newContact = new Contact({
                name,
                phoneNumber,
                group: groupId,
                userId: req.user.id,
                variables: variables || {}
            });

            const savedContact = await newContact.save();
            newContacts.push(savedContact);
        }

        if (newContacts.length === 0) {
            return res.status(400).json({ message: "No se pudieron crear nuevos contactos" });
        }

        res.status(201).json(newContacts);
    } catch (error) {
        console.error('Error al crear contactos desde Excel:', error);
        res.status(500).json({ message: "Error al crear contactos desde Excel" });
    }
};