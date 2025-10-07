-- CONSULTA 2: API keys del usuario
SELECT 
    id,
    name,
    key_prefix,
    usage_count,
    usage_limit,
    is_active,
    created_at,
    last_used_at
FROM api_keys 
WHERE user_id = '761ce82d-0f07-4f70-9b63-987a668b0907';
