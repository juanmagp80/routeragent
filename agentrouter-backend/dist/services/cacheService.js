"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
class CacheService {
    constructor(maxSize, ttlMinutes) {
        this.cache = new Map();
        this.maxSize = 1000;
        this.ttl = 3600000; // 1 hora en ms
        if (maxSize)
            this.maxSize = maxSize;
        if (ttlMinutes)
            this.ttl = ttlMinutes * 60 * 1000;
        // Limpiar cache periódicamente
        setInterval(() => this.cleanup(), 300000); // Cada 5 minutos
    }
    // Generar hash del input para cache inteligente
    generateHash(input) {
        // Normalizar input para mejor cache hit rate
        const normalized = input
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ') // Normalizar espacios
            .replace(/[^\w\s]/g, ''); // Remover puntuación para mejor matching
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    // Generar clave de cache
    generateCacheKey(input, taskType) {
        const inputHash = this.generateHash(input);
        return `${taskType}:${inputHash}`;
    }
    // Obtener del cache
    get(input, taskType) {
        const key = this.generateCacheKey(input, taskType);
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // Verificar TTL
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        // Incrementar hits
        entry.hits++;
        console.log(`💾 Cache HIT for ${taskType}: ${key} (hits: ${entry.hits})`);
        return entry.result;
    }
    // Guardar en cache
    set(input, taskType, result) {
        const key = this.generateCacheKey(input, taskType);
        const inputHash = this.generateHash(input);
        // Si el cache está lleno, remover entradas menos usadas
        if (this.cache.size >= this.maxSize) {
            this.evictLeastUsed();
        }
        const entry = {
            key,
            result,
            timestamp: Date.now(),
            hits: 0,
            taskType,
            inputHash
        };
        this.cache.set(key, entry);
        console.log(`💾 Cache SET for ${taskType}: ${key}`);
    }
    // Remover entradas menos usadas (LRU)
    evictLeastUsed() {
        let leastUsedKey = '';
        let minHits = Infinity;
        let oldestTime = Infinity;
        for (const [key, entry] of this.cache.entries()) {
            // Priorizar por hits, luego por antigüedad
            if (entry.hits < minHits || (entry.hits === minHits && entry.timestamp < oldestTime)) {
                minHits = entry.hits;
                oldestTime = entry.timestamp;
                leastUsedKey = key;
            }
        }
        if (leastUsedKey) {
            this.cache.delete(leastUsedKey);
            console.log(`🗑️  Cache evicted: ${leastUsedKey} (hits: ${minHits})`);
        }
    }
    // Limpiar entradas expiradas
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttl) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
        }
    }
    // Obtener estadísticas del cache
    getStats() {
        const taskCounts = new Map();
        let totalHits = 0;
        for (const entry of this.cache.values()) {
            totalHits += entry.hits;
            taskCounts.set(entry.taskType, (taskCounts.get(entry.taskType) || 0) + 1);
        }
        const topTasks = Array.from(taskCounts.entries())
            .map(([taskType, count]) => ({ taskType, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
            topTasks
        };
    }
    // Limpiar todo el cache
    clear() {
        this.cache.clear();
        console.log('🧹 Cache cleared completely');
    }
    // Invalidar cache por tipo de tarea
    invalidateByTaskType(taskType) {
        let invalidated = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (entry.taskType === taskType) {
                this.cache.delete(key);
                invalidated++;
            }
        }
        console.log(`🗑️  Invalidated ${invalidated} entries for task type: ${taskType}`);
        return invalidated;
    }
    // Precalentar cache con consultas comunes
    preWarm(commonQueries) {
        console.log(`🔥 Pre-warming cache with ${commonQueries.length} common queries`);
        for (const query of commonQueries) {
            this.set(query.input, query.taskType, query.result);
        }
    }
}
exports.CacheService = CacheService;
