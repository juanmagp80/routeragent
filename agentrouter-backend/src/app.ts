import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

// Cargar variables de entorno
dotenv.config();

// Importar controladores
import { getMetrics, routeTask } from './controllers/routeController';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet()); // Seguridad
app.use(cors()); // CORS
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded

// Rutas
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'AgentRouter MCP API',
        version: '1.0.0',
        endpoints: {
            'POST /v1/route': 'Route tasks to optimal AI model',
            'GET /v1/metrics': 'Get usage metrics'
        }
    });
});

// Ruta principal de ruteo
app.post('/v1/route', routeTask);

// Ruta de métricas
app.get('/v1/metrics', getMetrics);

// Manejador de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        success: false
    });
});

// Manejador para rutas no encontradas
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Route not found',
        success: false
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/`);
    console.log(`API docs: http://localhost:${PORT}/v1/route`);
});

export default app;