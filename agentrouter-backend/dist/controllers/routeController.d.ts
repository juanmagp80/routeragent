import { Request, Response } from 'express';
export declare const routeTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMetrics: (req: Request, res: Response) => Promise<void>;
