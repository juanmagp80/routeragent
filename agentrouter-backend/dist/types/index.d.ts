export interface ApiResponse<T> {
    data?: T;
    error?: string;
    success: boolean;
}
export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
}
