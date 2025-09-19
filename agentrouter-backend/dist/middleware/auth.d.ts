import { NextFunction, Request, Response } from 'express';
import { ApiKey } from '../models/ApiKey';
declare global {
    namespace Express {
        interface Request {
            apiKey?: ApiKey;
        }
    }
}
export declare const authenticateApiKey: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requirePlan: (requiredPlan: "free" | "starter" | "pro" | "enterprise") => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
