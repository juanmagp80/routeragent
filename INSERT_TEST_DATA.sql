-- Script para insertar datos de prueba en AgentRouter MCP
-- Ejecutar en Supabase SQL Editor para probar el dashboard con datos reales

-- ============================================
-- INSERTAR DATOS DE PRUEBA PARA MÉTRICAS
-- ============================================

-- Primero, obtener el ID del usuario autenticado actual
-- (Reemplazar este UUID con el ID real del usuario logueado)
DO $$
DECLARE
    test_user_id UUID;
    test_api_key_id UUID;
    i INTEGER;
BEGIN
    -- Obtener ID del primer usuario disponible (o usar el ID específico del usuario logueado)
    SELECT id INTO test_user_id FROM public.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No se encontraron usuarios. Crea un usuario primero.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Insertando datos para usuario: %', test_user_id;
    
    -- 1. Crear API Key de prueba si no existe
    INSERT INTO public.api_keys (
        id,
        user_id,
        name,
        key_hash,
        key_prefix,
        is_active,
        usage_count,
        last_used_at,
        rate_limit_per_hour,
        created_at
    ) VALUES (
        gen_random_uuid(),
        test_user_id,
        'API Key Principal',
        'hash_' || substr(md5(random()::text), 1, 32),
        'ak_test',
        true,
        156,
        NOW() - INTERVAL '2 hours',
        1000,
        NOW() - INTERVAL '7 days'
    ) ON CONFLICT DO NOTHING;
    
    -- Obtener el ID de la API key
    SELECT id INTO test_api_key_id FROM public.api_keys WHERE user_id = test_user_id LIMIT 1;
    
    -- 2. Insertar usage_records (registros de uso con costos)
    FOR i IN 1..25 LOOP
        INSERT INTO public.usage_records (
            user_id,
            api_key_id,
            model_used,
            cost,
            latency_ms,
            tokens_used,
            prompt_preview,
            created_at
        ) VALUES (
            test_user_id,
            test_api_key_id,
            CASE (i % 4)
                WHEN 0 THEN 'gpt-4'
                WHEN 1 THEN 'claude-3-sonnet'
                WHEN 2 THEN 'gpt-3.5-turbo'
                ELSE 'llama-2-70b'
            END,
            ROUND((RANDOM() * 0.5 + 0.01)::numeric, 6), -- Costo entre $0.01 y $0.51
            (RANDOM() * 500 + 50)::integer, -- Latencia entre 50ms y 550ms
            (RANDOM() * 1000 + 100)::integer, -- Tokens entre 100 y 1100
            'Texto de prueba...',
            NOW() - (RANDOM() * INTERVAL '30 days')
        );
    END LOOP;
    
    -- 3. Insertar tasks (tareas ejecutadas)
    FOR i IN 1..15 LOOP
        INSERT INTO public.tasks (
            user_id,
            api_key_id,
            task_type,
            input,
            output,
            model_selected,
            cost,
            latency_ms,
            tokens_used,
            status,
            created_at,
            updated_at,
            completed_at
        ) VALUES (
            test_user_id,
            test_api_key_id,
            CASE (i % 5)
                WHEN 0 THEN 'summary'
                WHEN 1 THEN 'translation'
                WHEN 2 THEN 'analysis'
                WHEN 3 THEN 'generation'
                ELSE 'classification'
            END,
            'Input de prueba para la tarea ' || i,
            'Output generado para la tarea ' || i,
            CASE (i % 3)
                WHEN 0 THEN 'gpt-4'
                WHEN 1 THEN 'claude-3-sonnet'
                ELSE 'gpt-3.5-turbo'
            END,
            ROUND((RANDOM() * 0.3 + 0.005)::numeric, 6), -- Costo entre $0.005 y $0.305
            (RANDOM() * 300 + 80)::integer, -- Latencia entre 80ms y 380ms
            (RANDOM() * 800 + 150)::integer, -- Tokens entre 150 y 950
            CASE (i % 10)
                WHEN 0 THEN 'pending'
                WHEN 1 THEN 'failed'
                ELSE 'completed'
            END,
            NOW() - (RANDOM() * INTERVAL '20 days'),
            NOW() - (RANDOM() * INTERVAL '20 days'),
            CASE 
                WHEN (i % 10) NOT IN (0, 1) THEN NOW() - (RANDOM() * INTERVAL '20 days')
                ELSE NULL
            END
        );
    END LOOP;
    
    -- 4. Insertar algunos usage_logs adicionales
    FOR i IN 1..35 LOOP
        INSERT INTO public.usage_logs (
            user_id,
            endpoint,
            method,
            status_code,
            execution_time_ms,
            model_used,
            tokens_used,
            cost_usd,
            created_at
        ) VALUES (
            test_user_id,
            '/api/v1/' || CASE (i % 4)
                WHEN 0 THEN 'chat/completions'
                WHEN 1 THEN 'embeddings'
                WHEN 2 THEN 'summarize'
                ELSE 'translate'
            END,
            'POST',
            CASE (i % 20)
                WHEN 0 THEN 500
                WHEN 1 THEN 429
                ELSE 200
            END,
            (RANDOM() * 200 + 30)::integer,
            CASE (i % 4)
                WHEN 0 THEN 'gpt-4'
                WHEN 1 THEN 'claude-3-sonnet'
                WHEN 2 THEN 'gpt-3.5-turbo'
                ELSE 'text-embedding-ada-002'
            END,
            (RANDOM() * 600 + 50)::integer,
            ROUND((RANDOM() * 0.2 + 0.002)::numeric, 6),
            NOW() - (RANDOM() * INTERVAL '25 days')
        );
    END LOOP;
    
    -- 5. Actualizar estadísticas del usuario
    UPDATE public.users 
    SET 
        api_usage_current = (
            SELECT COUNT(*) FROM public.usage_logs WHERE user_id = test_user_id
        ) + (
            SELECT COUNT(*) FROM public.tasks WHERE user_id = test_user_id
        ),
        last_login_at = NOW() - INTERVAL '1 hour',
        updated_at = NOW()
    WHERE id = test_user_id;
    
    RAISE NOTICE 'Datos de prueba insertados exitosamente!';
    RAISE NOTICE 'Usuario ID: %', test_user_id;
    RAISE NOTICE 'API Key ID: %', test_api_key_id;
    
END $$;

-- ============================================
-- VERIFICAR DATOS INSERTADOS
-- ============================================

-- Ver resumen de datos por usuario
SELECT 
    u.email,
    u.name,
    u.plan,
    u.api_usage_current,
    (SELECT COUNT(*) FROM public.usage_records WHERE user_id = u.id) as usage_records_count,
    (SELECT COUNT(*) FROM public.tasks WHERE user_id = u.id) as tasks_count,
    (SELECT COUNT(*) FROM public.usage_logs WHERE user_id = u.id) as usage_logs_count,
    (SELECT COUNT(*) FROM public.api_keys WHERE user_id = u.id AND is_active = true) as active_api_keys,
    (SELECT ROUND(SUM(cost)::numeric, 2) FROM public.usage_records WHERE user_id = u.id) as total_cost_records,
    (SELECT ROUND(SUM(cost)::numeric, 2) FROM public.tasks WHERE user_id = u.id) as total_cost_tasks
FROM public.users u
ORDER BY u.created_at DESC;
