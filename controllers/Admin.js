const express = require('express');
const router = express.Router();
const logic = require('../logic/Admin_logic');

// Endpoint para verificar si un usuario existe
router.post('/check-account', async (req, res) => {
    try {
        const { email } = req.body;
        const exists = await logic.checkUserExists(email);
        res.json({ userExists: exists });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint para autenticar un usuario
router.post('/auth', async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await logic.authenticateUser(email, password);
        if (token) {
            res.json({ message: 'success', token });
        } else {
            res.status(401).json({ message: 'failed', error: 'Correo electrónico o contraseña inválidos' });
        }
    } catch (error) {
        res.status(401).json({ message: 'failed', error: error.message });
    }
});

// GET endpoint para obtener todos los usuarios activos
router.get('/', async (req, res) => {
    try {
        const users = await logic.listActiveUsers();
        res.json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST endpoint para crear un nuevo usuario
router.post('/', async (req, res) => {
    try {
        const { nombre, apellido, email, password, address, tipoUsuario } = req.body;

        // Validación de los datos del usuario
        const { error } = logic.Schema.validate({
            name: nombre,
            lastName: apellido,
            email,
            password,
            address,
            userType: tipoUsuario
        });

        if (error) {
            return res.status(400).json({ error: error.details });
        }

        const user = await logic.createUser({
            name: nombre,
            lastName: apellido,
            email,
            password,
            address,
            userType: tipoUsuario
        });
        res.json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// PUT endpoint para actualizar los datos de un usuario
router.put('/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { error } = logic.Schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const result = await logic.updateUser(email, req.body);
        res.json({ user: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE endpoint para desactivar un usuario
router.delete('/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const result = await logic.deactivateUser(email);
        res.json({ user: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST endpoint para restablecer la contraseña
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Verificar si el usuario existe
        const userExists = await logic.checkUserExists(email);
        if (!userExists) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Actualizar la contraseña del usuario
        await logic.resetUserPassword(email, newPassword);

        res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(400).json({ error: 'No se pudo restablecer la contraseña' });
    }
});

module.exports = router;