// Configuración del sistema de monitoreo y alertas

export interface MonitoringConfig {
    // Umbrales para alertas
    thresholds: {
        high_cost_per_request: number; // $0.10 por request
        high_latency: number; // 5000ms
        error_rate: number; // 5%
        usage_limit_warning: number; // 80% del límite
    };

    // Configuración de alertas
    alerts: {
        enabled: boolean;
        channels: {
            email: boolean;
            slack: boolean;
            discord: boolean;
        };
        cooldown_period: number; // 30 minutos entre alertas repetidas
    };

    // Métricas a recolectar
    metrics: {
        collect_detailed_logs: boolean;
        retention_days: number; // 30 días
        sample_rate: number; // 100% de las requests
    };

    // Integraciones externas
    integrations: {
        prometheus_enabled: boolean;
        grafana_enabled: boolean;
        datadog_enabled: boolean;
    };
}

export const monitoringConfig: MonitoringConfig = {
    thresholds: {
        high_cost_per_request: 0.10,
        high_latency: 5000,
        error_rate: 0.05,
        usage_limit_warning: 0.80
    },

    alerts: {
        enabled: true,
        channels: {
            email: true,
            slack: false,
            discord: false
        },
        cooldown_period: 30 * 60 * 1000 // 30 minutos
    },

    metrics: {
        collect_detailed_logs: true,
        retention_days: 30,
        sample_rate: 1.0
    },

    integrations: {
        prometheus_enabled: true,
        grafana_enabled: true,
        datadog_enabled: false
    }
};

// Tipos de alertas
export type AlertType =
    | 'HIGH_COST_PER_REQUEST'
    | 'HIGH_LATENCY'
    | 'HIGH_ERROR_RATE'
    | 'USAGE_LIMIT_WARNING'
    | 'SYSTEM_OVERLOAD'
    | 'MODEL_UNAVAILABLE'
    | 'CACHE_MISS_RATE_HIGH';

// Niveles de severidad
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Interface para una alerta
export interface Alert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    message: string;
    timestamp: Date;
    resolved: boolean;
    metadata?: Record<string, any>;
}

// Interface para métricas de sistema
export interface SystemMetrics {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_in: number;
    network_out: number;
    uptime: number;
    timestamp: Date;
}

// Interface para métricas de aplicación
export interface AppMetrics {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    avg_response_time: number;
    avg_cost_per_request: number;
    total_cost: number;
    cache_hit_rate: number;
    model_distribution: Record<string, number>;
    timestamp: Date;
}

// Interface para métricas de usuario
export interface UserMetrics {
    user_id: string;
    total_requests: number;
    total_cost: number;
    avg_cost_per_request: number;
    models_used: string[];
    usage_trend: 'increasing' | 'decreasing' | 'stable';
    timestamp: Date;
}

// Interface para métricas de modelo
export interface ModelMetrics {
    model_name: string;
    total_requests: number;
    total_cost: number;
    avg_response_time: number;
    error_rate: number;
    cache_hit_rate: number;
    timestamp: Date;
}

// Interface para métricas de cache
export interface CacheMetrics {
    size: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
    evictionCount: number;
    timestamp: Date;
}

// Interface para métricas de uso por API key
export interface ApiKeyMetrics {
    key_id: string;
    key_prefix: string;
    user_id: string;
    total_requests: number;
    total_cost: number;
    avg_cost_per_request: number;
    usage_percentage: number; // Porcentaje del límite usado
    last_used: Date;
    timestamp: Date;
}

// Interface para métricas de rendimiento
export interface PerformanceMetrics {
    system: SystemMetrics;
    app: AppMetrics;
    users: UserMetrics[];
    models: ModelMetrics[];
    cache: CacheMetrics;
    api_keys: ApiKeyMetrics[];
    timestamp: Date;
}

// Interface para configuración de alertas personalizadas por usuario
export interface UserAlertConfig {
    user_id: string;
    enabled_alerts: AlertType[];
    threshold_multipliers: Record<AlertType, number>; // Multiplicadores para ajustar umbrales
    notification_channels: {
        email: boolean;
        slack: boolean;
        discord: boolean;
    };
    cooldown_periods: Record<AlertType, number>; // Periodos de cooldown personalizados
}

// Configuración predeterminada para alertas de usuario
export const defaultUserAlertConfig: UserAlertConfig = {
    user_id: 'default',
    enabled_alerts: [
        'HIGH_COST_PER_REQUEST',
        'HIGH_LATENCY',
        'HIGH_ERROR_RATE',
        'USAGE_LIMIT_WARNING'
    ],
    threshold_multipliers: {
        HIGH_COST_PER_REQUEST: 1.0,
        HIGH_LATENCY: 1.0,
        HIGH_ERROR_RATE: 1.0,
        USAGE_LIMIT_WARNING: 1.0,
        SYSTEM_OVERLOAD: 1.0,
        MODEL_UNAVAILABLE: 1.0,
        CACHE_MISS_RATE_HIGH: 1.0
    },
    notification_channels: {
        email: true,
        slack: false,
        discord: false
    },
    cooldown_periods: {
        HIGH_COST_PER_REQUEST: 30 * 60 * 1000,
        HIGH_LATENCY: 30 * 60 * 1000,
        HIGH_ERROR_RATE: 30 * 60 * 1000,
        USAGE_LIMIT_WARNING: 24 * 60 * 1000, // Una vez por día para límites
        SYSTEM_OVERLOAD: 15 * 60 * 1000,
        MODEL_UNAVAILABLE: 60 * 60 * 1000,
        CACHE_MISS_RATE_HIGH: 60 * 60 * 1000
    }
};