import { Request, Response } from 'express';
import { CreateUserInput, UpdateUserInput } from '../models/User';
import { UserService } from '../services/userService';

const userService = new UserService();

// Obtener todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();

        res.json({
            users,
            success: true,
            count: users.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            error: "Failed to fetch users",
            success: false
        });
    }
};

// Obtener un usuario por ID
export const getUserById = async (req: Request, res: Response) => {
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
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            error: "Failed to fetch user",
            success: false
        });
    }
};

// Crear un nuevo usuario
export const createUser = async (req: Request, res: Response) => {
    try {
        const userData: CreateUserInput = req.body;

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
    } catch (error: any) {
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

// Actualizar un usuario
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData: UpdateUserInput = req.body;

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
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            error: "Failed to update user",
            success: false
        });
    }
};

// Eliminar un usuario
export const deleteUser = async (req: Request, res: Response) => {
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
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            error: "Failed to delete user",
            success: false
        });
    }
};