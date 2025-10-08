"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
// Configuración de conexión a Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'your-supabase-key';
console.log('🔗 Backend Supabase config:', {
    url: supabaseUrl,
    hasKey: !!supabaseKey,
    keySource: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' : process.env.SUPABASE_KEY ? 'SUPABASE_KEY' : 'default'
});
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
