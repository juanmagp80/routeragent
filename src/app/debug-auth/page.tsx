"use client";

import { supabase } from '@/config/database';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
    const [sessionInfo, setSessionInfo] = useState<any>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [tokenInfo, setTokenInfo] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const checkAuth = async () => {
            // 1. Verificar sesión
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            console.log('🔍 Session:', session);
            setSessionInfo(session);

            // 2. Verificar usuario
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            console.log('🔍 User:', user);
            setUserInfo(user);

            // 3. Obtener token
            const token = session?.access_token;
            console.log('🔍 Token:', token ? `${token.substring(0, 20)}...` : 'None');
            setTokenInfo(token || null);
        };

        checkAuth();
    }, []);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">🔍 Auth Debug Information</h1>

            <div className="space-y-6">
                {/* Context User */}
                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">👤 Context User:</h2>
                    <pre className="text-sm overflow-auto">
                        {user ? JSON.stringify(user, null, 2) : 'No user in context'}
                    </pre>
                </div>

                {/* Supabase Session */}
                <div className="bg-blue-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">🔐 Supabase Session:</h2>
                    <pre className="text-sm overflow-auto">
                        {sessionInfo ? JSON.stringify(sessionInfo, null, 2) : 'No session'}
                    </pre>
                </div>

                {/* Supabase User */}
                <div className="bg-green-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">👥 Supabase User:</h2>
                    <pre className="text-sm overflow-auto">
                        {userInfo ? JSON.stringify(userInfo, null, 2) : 'No user'}
                    </pre>
                </div>

                {/* Token */}
                <div className="bg-yellow-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">🔑 Access Token:</h2>
                    <p className="text-sm font-mono break-all">
                        {tokenInfo ? `${tokenInfo.substring(0, 50)}...` : 'No token'}
                    </p>
                </div>

                {/* Test API Call */}
                <div className="bg-red-100 p-4 rounded">
                    <h2 className="font-semibold mb-2">🧪 Test API Call:</h2>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={async () => {
                            try {
                                const token = await supabase.auth.getSession();
                                const accessToken = token.data.session?.access_token;

                                const response = await fetch('http://localhost:3002/v1/api-keys', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${accessToken}`
                                    },
                                    body: JSON.stringify({
                                        name: 'Test Debug API Key'
                                    })
                                });

                                const result = await response.json();
                                console.log('API Response:', result);
                                alert(`Response: ${response.status} - ${JSON.stringify(result)}`);
                            } catch (error) {
                                console.error('API Error:', error);
                                alert(`Error: ${error}`);
                            }
                        }}
                    >
                        Test Create API Key
                    </button>
                </div>
            </div>
        </div>
    );
}