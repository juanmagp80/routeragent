"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
async function initDatabase() {
    console.log('Initializing database...');
    try {
        // Crear tabla de usuarios
        const { error: usersTableError } = await database_1.supabase.rpc('create_users_table');
        if (usersTableError) {
            console.error('Error creating users table:', usersTableError);
        }
        else {
            console.log('Users table created successfully');
        }
        // Crear tabla de claves API
        const { error: apiKeysTableError } = await database_1.supabase.rpc('create_api_keys_table');
        if (apiKeysTableError) {
            console.error('Error creating API keys table:', apiKeysTableError);
        }
        else {
            console.log('API keys table created successfully');
        }
        // Crear tabla de registros de uso
        const { error: usageRecordsTableError } = await database_1.supabase.rpc('create_usage_records_table');
        if (usageRecordsTableError) {
            console.error('Error creating usage records table:', usageRecordsTableError);
        }
        else {
            console.log('Usage records table created successfully');
        }
        // Crear tabla de tareas
        const { error: tasksTableError } = await database_1.supabase.rpc('create_tasks_table');
        if (tasksTableError) {
            console.error('Error creating tasks table:', tasksTableError);
        }
        else {
            console.log('Tasks table created successfully');
        }
        // Crear tabla de métricas de rendimiento
        const { error: performanceMetricsTableError } = await database_1.supabase.rpc('create_performance_metrics_table');
        if (performanceMetricsTableError) {
            console.error('Error creating performance metrics table:', performanceMetricsTableError);
        }
        else {
            console.log('Performance metrics table created successfully');
        }
        // Crear tabla de caché
        const { error: cacheTableError } = await database_1.supabase.rpc('create_cache_table');
        if (cacheTableError) {
            console.error('Error creating cache table:', cacheTableError);
        }
        else {
            console.log('Cache table created successfully');
        }
        // Crear tabla de registros de logs
        const { error: logsTableError } = await database_1.supabase.rpc('create_logs_table');
        if (logsTableError) {
            console.error('Error creating logs table:', logsTableError);
        }
        else {
            console.log('Logs table created successfully');
        }
        // Crear tabla de suscripciones
        const { error: subscriptionsTableError } = await database_1.supabase.rpc('create_subscriptions_table');
        if (subscriptionsTableError) {
            console.error('Error creating subscriptions table:', subscriptionsTableError);
        }
        else {
            console.log('Subscriptions table created successfully');
        }
        // Crear tabla de facturas
        const { error: invoicesTableError } = await database_1.supabase.rpc('create_invoices_table');
        if (invoicesTableError) {
            console.error('Error creating invoices table:', invoicesTableError);
        }
        else {
            console.log('Invoices table created successfully');
        }
        // Crear tabla de notificaciones
        const { error: notificationsTableError } = await database_1.supabase.rpc('create_notifications_table');
        if (notificationsTableError) {
            console.error('Error creating notifications table:', notificationsTableError);
        }
        else {
            console.log('Notifications table created successfully');
        }
        // Crear tabla de configuraciones del sistema
        const { error: systemConfigTableError } = await database_1.supabase.rpc('create_system_config_table');
        if (systemConfigTableError) {
            console.error('Error creating system config table:', systemConfigTableError);
        }
        else {
            console.log('System config table created successfully');
        }
        // Crear tabla de modelos de IA
        const { error: aiModelsTableError } = await database_1.supabase.rpc('create_ai_models_table');
        if (aiModelsTableError) {
            console.error('Error creating AI models table:', aiModelsTableError);
        }
        else {
            console.log('AI models table created successfully');
        }
        // Crear tabla de proveedores de IA
        const { error: aiProvidersTableError } = await database_1.supabase.rpc('create_ai_providers_table');
        if (aiProvidersTableError) {
            console.error('Error creating AI providers table:', aiProvidersTableError);
        }
        else {
            console.log('AI providers table created successfully');
        }
        // Crear tabla de configuraciones de ruteo
        const { error: routingConfigTableError } = await database_1.supabase.rpc('create_routing_config_table');
        if (routingConfigTableError) {
            console.error('Error creating routing config table:', routingConfigTableError);
        }
        else {
            console.log('Routing config table created successfully');
        }
        // Crear tabla de historial de ruteo
        const { error: routingHistoryTableError } = await database_1.supabase.rpc('create_routing_history_table');
        if (routingHistoryTableError) {
            console.error('Error creating routing history table:', routingHistoryTableError);
        }
        else {
            console.log('Routing history table created successfully');
        }
        // Insertar configuraciones iniciales
        const { error: systemConfigInsertError } = await database_1.supabase.rpc('insert_initial_system_config');
        if (systemConfigInsertError) {
            console.error('Error inserting initial system config:', systemConfigInsertError);
        }
        else {
            console.log('Initial system config inserted successfully');
        }
        // Insertar modelos de IA iniciales
        const { error: aiModelsInsertError } = await database_1.supabase.rpc('insert_initial_ai_models');
        if (aiModelsInsertError) {
            console.error('Error inserting initial AI models:', aiModelsInsertError);
        }
        else {
            console.log('Initial AI models inserted successfully');
        }
        // Insertar proveedores de IA iniciales
        const { error: aiProvidersInsertError } = await database_1.supabase.rpc('insert_initial_ai_providers');
        if (aiProvidersInsertError) {
            console.error('Error inserting initial AI providers:', aiProvidersInsertError);
        }
        else {
            console.log('Initial AI providers inserted successfully');
        }
        // Insertar configuraciones de ruteo iniciales
        const { error: routingConfigInsertError } = await database_1.supabase.rpc('insert_initial_routing_config');
        if (routingConfigInsertError) {
            console.error('Error inserting initial routing config:', routingConfigInsertError);
        }
        else {
            console.log('Initial routing config inserted successfully');
        }
        console.log('Database initialization completed');
    }
    catch (error) {
        console.error('Error initializing database:', error);
    }
}
// Ejecutar la inicialización si se llama directamente
if (require.main === module) {
    initDatabase();
}
exports.default = initDatabase;
