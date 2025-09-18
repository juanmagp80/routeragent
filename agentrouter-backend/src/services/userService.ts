import { CreateUserInput, UpdateUserInput, User, UserResponse } from '../models/User';

// Mock de datos de usuarios (en producción esto vendría de una base de datos)
let mockUsers: User[] = [
    {
        id: "1",
        email: "john@example.com",
        password_hash: "hashed_password_1",
        name: "John Developer",
        plan: "pro",
        api_key_limit: 10,
        usage_limit: 10000,
        usage_count: 2450,
        is_active: true,
        email_verified: true,
        created_at: "2023-01-15T09:30:00Z",
        updated_at: "2023-06-20T14:45:00Z",
        last_login: "2023-06-20T14:45:00Z",
        two_factor_enabled: false,
        failed_login_attempts: 0,
        roles: ["admin"],
        permissions: ["read:users", "write:users", "read:api_keys", "write:api_keys"],
        company: "Tech Corp",
        timezone: "Europe/Madrid",
        language: "en"
    },
    {
        id: "2",
        email: "sarah@example.com",
        password_hash: "hashed_password_2",
        name: "Sarah Manager",
        plan: "pro",
        api_key_limit: 5,
        usage_limit: 5000,
        usage_count: 1200,
        is_active: true,
        email_verified: true,
        created_at: "2023-02-10T11:20:00Z",
        updated_at: "2023-06-19T09:15:00Z",
        last_login: "2023-06-19T09:15:00Z",
        two_factor_enabled: false,
        failed_login_attempts: 0,
        roles: ["manager"],
        permissions: ["read:users", "read:api_keys"],
        company: "Tech Corp",
        timezone: "Europe/Madrid",
        language: "en"
    },
    {
        id: "3",
        email: "mike@example.com",
        password_hash: "hashed_password_3",
        name: "Mike Analyst",
        plan: "starter",
        api_key_limit: 2,
        usage_limit: 1000,
        usage_count: 850,
        is_active: false,
        email_verified: true,
        created_at: "2023-03-05T16:40:00Z",
        updated_at: "2023-05-15T10:30:00Z",
        last_login: "2023-05-15T10:30:00Z",
        two_factor_enabled: false,
        failed_login_attempts: 0,
        roles: ["user"],
        permissions: ["read:api_keys"],
        company: "Tech Corp",
        timezone: "Europe/Madrid",
        language: "en"
    }
];

export class UserService {
    // Obtener todos los usuarios
    async getAllUsers(): Promise<UserResponse[]> {
        return mockUsers.map(user => {
            const { password_hash, password_reset_token, password_reset_expires, email_verification_token, email_verification_expires, two_factor_secret, ...userResponse } = user;
            return userResponse;
        });
    }

    // Obtener un usuario por ID
    async getUserById(id: string): Promise<UserResponse | null> {
        const user = mockUsers.find(u => u.id === id);
        if (!user) return null;

        const { password_hash, password_reset_token, password_reset_expires, email_verification_token, email_verification_expires, two_factor_secret, ...userResponse } = user;
        return userResponse;
    }

    // Crear un nuevo usuario
    async createUser(userData: CreateUserInput): Promise<UserResponse> {
        // Verificar si el email ya existe
        const existingUser = mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Crear nuevo usuario
        const newUser: User = {
            id: (mockUsers.length + 1).toString(),
            email: userData.email,
            password_hash: `hashed_${userData.password}`, // En producción, usar bcrypt
            name: userData.name,
            plan: userData.plan || 'starter',
            api_key_limit: 1, // Valor por defecto
            usage_limit: 1000, // Valor por defecto
            usage_count: 0,
            is_active: true,
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            two_factor_enabled: false,
            failed_login_attempts: 0,
            roles: ['user'],
            permissions: [],
            company: userData.company,
            timezone: userData.timezone,
            language: userData.language
        };

        mockUsers.push(newUser);

        const { password_hash, password_reset_token, password_reset_expires, email_verification_token, email_verification_expires, two_factor_secret, ...userResponse } = newUser;
        return userResponse;
    }

    // Actualizar un usuario
    async updateUser(id: string, updateData: UpdateUserInput): Promise<UserResponse | null> {
        const userIndex = mockUsers.findIndex(u => u.id === id);
        if (userIndex === -1) return null;

        // Actualizar usuario
        const updatedUser: User = {
            ...mockUsers[userIndex],
            ...updateData,
            updated_at: new Date().toISOString()
        };

        mockUsers[userIndex] = updatedUser;

        const { password_hash, password_reset_token, password_reset_expires, email_verification_token, email_verification_expires, two_factor_secret, ...userResponse } = updatedUser;
        return userResponse;
    }

    // Eliminar un usuario
    async deleteUser(id: string): Promise<boolean> {
        const userIndex = mockUsers.findIndex(u => u.id === id);
        if (userIndex === -1) return false;

        mockUsers.splice(userIndex, 1);
        return true;
    }

    // Obtener usuarios por email
    async getUserByEmail(email: string): Promise<UserResponse | null> {
        const user = mockUsers.find(u => u.email === email);
        if (!user) return null;

        const { password_hash, password_reset_token, password_reset_expires, email_verification_token, email_verification_expires, two_factor_secret, ...userResponse } = user;
        return userResponse;
    }
}