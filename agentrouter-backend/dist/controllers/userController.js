"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const userService_1 = require("../services/userService");
const userService = new userService_1.UserService();
// Obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json({
            users,
            success: true,
            count: users.length
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            error: "Failed to fetch users",
            success: false
        });
    }
};
exports.getUsers = getUsers;
// Obtener un usuario por ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({
                error: "User not found",
                success: false
            });
        }
        res.json({
            user,
            success: true
        });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            error: "Failed to fetch user",
            success: false
        });
    }
};
exports.getUserById = getUserById;
// Crear un nuevo usuario
const createUser = async (req, res) => {
    try {
        const userData = req.body;
        // Validar datos requeridos
        if (!userData.email || !userData.name || !userData.password) {
            return res.status(400).json({
                error: "Email, name, and password are required",
                success: false
            });
        }
        const user = await userService.createUser(userData);
        res.status(201).json({
            user,
            success: true,
            message: "User created successfully"
        });
    }
    catch (error) {
        if (error.message === "User with this email already exists") {
            return res.status(409).json({
                error: error.message,
                success: false
            });
        }
        console.error('Error creating user:', error);
        res.status(500).json({
            error: "Failed to create user",
            success: false
        });
    }
};
exports.createUser = createUser;
// Actualizar un usuario
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const user = await userService.updateUser(id, updateData);
        if (!user) {
            return res.status(404).json({
                error: "User not found",
                success: false
            });
        }
        res.json({
            user,
            success: true,
            message: "User updated successfully"
        });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            error: "Failed to update user",
            success: false
        });
    }
};
exports.updateUser = updateUser;
// Eliminar un usuario
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await userService.deleteUser(id);
        if (!deleted) {
            return res.status(404).json({
                error: "User not found",
                success: false
            });
        }
        res.json({
            success: true,
            message: "User deleted successfully"
        });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            error: "Failed to delete user",
            success: false
        });
    }
};
exports.deleteUser = deleteUser;
