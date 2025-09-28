import { Request } from 'express';
import { ApiKey } from '../models/ApiKey';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name?: string;
        plan?: string;
        [key: string]: any;
    };
    apiKey?: ApiKey;
    body: any;
    params: any;
    headers: any;
}
export interface JWTPayload {
    sub: string;
    email: string;
    aud: string;
    exp: number;
    iat: number;
    iss: string;
    [key: string]: any;
}
