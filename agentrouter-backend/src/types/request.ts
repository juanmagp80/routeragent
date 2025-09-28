// Extender el tipo Request de Express para incluir propiedades personalizadas
import { Request } from 'express';
import { ApiKey } from '../models/ApiKey';

// Interfaz que extiende completamente Request con todas sus propiedades
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    plan?: string;
    [key: string]: any;
  };
  apiKey?: ApiKey;
  // Asegurar que body, params y headers están disponibles
  body: any;
  params: any;
  headers: any;
}

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  [key: string]: any;
}
