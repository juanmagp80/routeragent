"use client";

import { useEffect, useState } from "react";
import { backendServiceDev, BillingInfo } from "@/services/backendServiceDev";
import { plans, getPlanById } from "@/config/plans";

export default function BillingPage() {
    const [billingData, setBillingData] = useState<BillingInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        loadBillingData();
        
        // Verificar si hay parámetros de éxito en la URL (retorno de Stripe)
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const cancelled = urlParams.get('cancelled');
        const sessionId = urlParams.get('session_id');
        
        if (success === 'true') {
            alert('¡Pago exitoso! Tu plan ha sido actualizado.');
            // Recargar los datos de billing para mostrar el nuevo plan
            loadBillingData();
            // Limpiar los parámetros de la URL
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
        } else if (cancelled === 'true') {
            alert('Pago cancelado. Puedes intentar de nuevo cuando quieras.');
            // Limpiar los parámetros de la URL
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
        }
    }, []);

    const loadBillingData = async () => {
        try {
            console.log('💳 Loading billing data...');
            setLoading(true);
            const data = await backendServiceDev.getBilling();
            console.log('✅ Billing data loaded:', data);
            setBillingData(data);
        } catch (error) {
            console.error('❌ Error loading billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgradeToPlan = async (planId: string) => {
        try {
            console.log(`🚀 Starting upgrade to plan: ${planId}`);
            const currentUrl = window.location.origin;
            const successUrl = `${currentUrl}/admin/billing?success=true&plan=${planId}`;
            const cancelUrl = `${currentUrl}/admin/billing?cancelled=true`;
            
            console.log('📝 Creating checkout session with:', { planId, successUrl, cancelUrl });
            
            const checkoutSession = await backendServiceDev.createCheckoutSession(planId, successUrl, cancelUrl);
            
            console.log('✅ Checkout session received:', checkoutSession);
            
            // Redirigir a Stripe Checkout
            console.log('🔄 Redirecting to:', checkoutSession.url);
            window.location.href = checkoutSession.url;
        } catch (error) {
            console.error('❌ Error creating checkout session:', error);
            alert('Error al crear sesión de pago. Inténtalo de nuevo.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!billingData) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No se pudieron cargar los datos de facturación</p>
            </div>
        );
    }

    return (
        <div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Gestiona tu suscripción y métodos de pago
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plan actual */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Plan Actual</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {billingData.current_plan.name}
                        </p>
                    </div>
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold text-gray-900">
                                    €{billingData.current_plan.price}
                                    {billingData.current_plan.price > 0 && <span className="text-sm text-gray-500 ml-1">/ mes</span>}
                                </p>
                                {billingData.current_plan.price === 0 && (
                                    <p className="text-sm text-gray-500">Plan gratuito</p>
                                )}
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                billingData.current_plan.status === 'active' 
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {billingData.current_plan.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-900">Características del Plan</h3>
                            <ul className="mt-2 space-y-2">
                                <li className="flex items-center">
                                    <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-2 text-sm text-gray-700">
                                        {billingData.usage.request_limit === -1 
                                            ? 'Requests ilimitados por mes'
                                            : `Hasta ${billingData.usage.request_limit.toLocaleString()} requests por mes`
                                        }
                                    </span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-2 text-sm text-gray-700">Acceso a modelos de IA</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-2 text-sm text-gray-700">Soporte básico</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Próxima Facturación</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(billingData.current_plan.next_billing_date).toLocaleDateString('es-ES')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Método de Pago</p>
                                    <p className="text-sm text-gray-500">
                                        {billingData.payment_method.brand.toUpperCase()} terminada en {billingData.payment_method.last4}
                                    </p>
                                </div>
                                <button className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                    Actualizar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medidor de uso */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Uso de Requests</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Seguimiento de tu uso de la API
                        </p>
                    </div>
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{billingData.usage.current_requests.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">
                                    de {billingData.usage.request_limit === -1 
                                        ? '∞' 
                                        : billingData.usage.request_limit.toLocaleString()
                                    } requests
                                </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                {billingData.usage.usage_percentage}%
                            </span>
                        </div>

                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-emerald-600 h-2.5 rounded-full"
                                    style={{ width: `${billingData.usage.usage_percentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                    Costo Total del Período
                                </p>
                                <p className="text-lg font-bold text-gray-900">€{billingData.usage.total_cost.toFixed(2)}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Desde {new Date(billingData.usage.billing_period_start).toLocaleDateString('es-ES')}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowUpgradeModal(true)}
                                className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                Mejorar Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Historial de facturas */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Historial de Facturas</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Descargar facturas anteriores
                    </p>
                </div>
                <div className="divide-y divide-gray-200">
                    {billingData.invoices && billingData.invoices.length > 0 ? (
                        billingData.invoices.map((invoice) => (
                            <div key={invoice.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{invoice.id}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(invoice.date).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <p className="text-sm font-medium text-gray-900">
                                            €{invoice.amount.toFixed(2)}
                                        </p>
                                        <span className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            invoice.status === "paid"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}>
                                            {invoice.status === "paid" ? "Pagado" : "Pendiente"}
                                        </span>
                                        <button className="ml-4 text-sm font-medium text-emerald-600 hover:text-emerald-500">
                                            Descargar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center">
                            <p className="text-gray-500">No hay facturas disponibles</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de selección de planes */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Seleccionar Plan
                                </h3>
                                <button
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Plan Pro */}
                                <div className="border border-gray-200 rounded-lg p-6 hover:border-emerald-500 transition-colors">
                                    <div className="text-center">
                                        <h4 className="text-xl font-semibold text-gray-900">Plan Pro</h4>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">€49<span className="text-sm text-gray-500">/mes</span></p>
                                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                            <li>• Hasta 5,000 requests/mes</li>
                                            <li>• Acceso a todos los modelos de IA</li>
                                            <li>• Soporte prioritario</li>
                                            <li>• Analíticas avanzadas</li>
                                        </ul>
                                        <button
                                            onClick={() => handleUpgradeToPlan('pro')}
                                            className="w-full mt-4 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
                                        >
                                            Seleccionar Pro
                                        </button>
                                    </div>
                                </div>

                                {/* Plan Enterprise */}
                                <div className="border border-gray-200 rounded-lg p-6 hover:border-emerald-500 transition-colors">
                                    <div className="text-center">
                                        <h4 className="text-xl font-semibold text-gray-900">Plan Enterprise</h4>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">€299<span className="text-sm text-gray-500">/mes</span></p>
                                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                            <li>• Requests ilimitados</li>
                                            <li>• Acceso a modelos premium</li>
                                            <li>• Soporte dedicado</li>
                                            <li>• Analíticas completas</li>
                                        </ul>
                                        <button
                                            onClick={() => handleUpgradeToPlan('enterprise')}
                                            className="w-full mt-4 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
                                        >
                                            Seleccionar Enterprise
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-500">
                                    Usa la tarjeta de prueba 4242 4242 4242 4242 para testing
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}