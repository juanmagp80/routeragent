import { Request, Response } from 'express';
export declare const createApiKey: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listApiKeys: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deactivateApiKey: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getApiKeyStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const validateApiKey: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
