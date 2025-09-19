import { UserResponse } from '../models/User';
export declare class AuthService {
    register(userData: {
        email: string;
        password: string;
        name: string;
    }): Promise<{
        user: UserResponse | null;
        error: string | null;
    }>;
    login(email: string, password: string): Promise<{
        user: UserResponse | null;
        error: string | null;
    }>;
    logout(): Promise<{
        error: string | null;
    }>;
    getCurrentUser(): Promise<{
        user: UserResponse | null;
        error: string | null;
    }>;
    sendVerificationEmail(email: string): Promise<{
        error: string | null;
    }>;
    verifyEmail(token: string, email: string): Promise<{
        user: UserResponse | null;
        error: string | null;
    }>;
    requestPasswordReset(email: string): Promise<{
        error: string | null;
    }>;
    resetPassword(email: string, token: string, newPassword: string): Promise<{
        error: string | null;
    }>;
}
