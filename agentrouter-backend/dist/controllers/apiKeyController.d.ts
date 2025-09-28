import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/request';
export declare const createApiKey: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listApiKeys: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deactivateApiKey: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getApiKeyStats: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const validateApiKey: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteApiKey: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
