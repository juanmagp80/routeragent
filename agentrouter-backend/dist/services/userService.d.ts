import { CreateUserInput, UpdateUserInput, UserResponse } from '../models/User';
export declare class UserService {
    getAllUsers(): Promise<UserResponse[]>;
    getUserById(id: string): Promise<UserResponse | null>;
    createUser(userData: CreateUserInput): Promise<UserResponse>;
    updateUser(id: string, updateData: UpdateUserInput): Promise<UserResponse | null>;
    deleteUser(id: string): Promise<boolean>;
    getUserByEmail(email: string): Promise<UserResponse | null>;
}
