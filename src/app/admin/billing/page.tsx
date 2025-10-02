"use client";

import { useAuth } from "@/hooks/useAuth";
import {
    Activity,
    BarChart3,
    Calendar,
    CheckCircle,
    CreditCard,
    DollarSign,
    Download,
    PiggyBank,
    Rocket,
    Star,
    TrendingUp
} from "lucide-react";
import { useState } from "react";

interface BillingData {
    currentPlan: string;
    nextBillingDate: string;
    monthlyUsage: number;
    monthlyLimit: number;
    totalSpent: number;
    invoices: any[];
}

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 29,
        requests: '10,000',
        features: ['Acceso básico a IA', 'Soporte por email', 'Dashboard básico', '✓ Configurado en Stripe'],
        popular: false,
        gradient: 'from-blue-500 to-indigo-600'
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 45,
        requests: '100,000',
        features: ['Acceso completo a IA', 'Soporte prioritario', 'Analytics avanzado', 'API personalizada'],
        popular: true,
        gradient: 'from-purple-500 to-pink-600'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 299,
        requests: 'Ilimitado',
        features: ['Todo en Professional', 'Soporte 24/7', 'Infraestructura dedicada', 'Personalización completa'],
        popular: false,
        gradient: 'from-emerald-500 to-teal-600'
    }
];

export default function BillingPage() {
    const { user, loading } = useAuth();
    const [billingData, setBillingData] = useState<BillingData>({
        currentPlan: 'Professional',
        nextBillingDate: '2025-11-02',
        monthlyUsage: 75430,
        monthlyLimit: 100000,
        totalSpent: 135,
        invoices: []
    });

    const [activeTab, setActiveTab] = useState('overview');

    const usagePercentage = (billingData.monthlyUsage / billingData.monthlyLimit) * 100;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                <div>
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Facturación</h1>
                            <p className="text-gray-600 mt-1">
                                Gestiona tu suscripción y métodos de pago
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Plan Actual</p>
                                    <p className="text-lg font-semibold text-gray-900">{billingData.currentPlan}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Uso Mensual</p>
                                    <p className="text-lg font-semibold text-gray-900">{usagePercentage.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Próximo Pago</p>
                                    <p className="text-lg font-semibold text-gray-900">2 Nov</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navegación de pestañas */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'overview', label: 'Resumen', icon: BarChart3 },
                        { id: 'plans', label: 'Planes', icon: Rocket },
                        { id: 'invoices', label: 'Facturas', icon: Download }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === id
                                    ? 'border-emerald-500 text-emerald-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Contenido de pestañas */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Estadísticas de uso */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-emerald-100 rounded-lg p-2">
                                <Activity className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Estadísticas de Uso
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Requests utilizados</span>
                                    <span className="text-sm text-gray-500">
                                        {billingData.monthlyUsage.toLocaleString()} / {billingData.monthlyLimit.toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${usagePercentage > 90 ? 'bg-red-500' :
                                                usagePercentage > 75 ? 'bg-yellow-500' : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {usagePercentage > 90 ? '¡Cerca del límite!' :
                                        usagePercentage > 75 ? 'Uso alto' : 'Uso normal'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">Crecimiento</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-900">+23%</p>
                                    <p className="text-xs text-green-600">vs mes anterior</p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <PiggyBank className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm font-medium text-emerald-800">Ahorrado</span>
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-900">€47</p>
                                    <p className="text-xs text-emerald-600">con RouterAI</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información de facturación */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-100 rounded-lg p-2">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Información de Pago
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Plan {billingData.currentPlan}</p>
                                    <p className="text-sm text-gray-500">Facturación mensual</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-gray-900">€45</p>
                                    <p className="text-sm text-gray-500">/mes</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Próximo pago:</span>
                                    <span className="font-medium">{new Date(billingData.nextBillingDate).toLocaleDateString('es-ES')}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Método de pago:</span>
                                    <span className="font-medium">•••• •••• •••• 4242</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total gastado:</span>
                                    <span className="font-bold text-green-600">€{billingData.totalSpent}</span>
                                </div>
                            </div>

                            <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center justify-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Actualizar Método de Pago
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'plans' && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Elige el Plan Perfecto para Ti
                        </h2>
                        <p className="text-gray-600">
                            Escala tu negocio con nuestros planes flexibles
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative bg-white rounded-2xl shadow-lg border-2 p-6 ${plan.popular
                                        ? 'border-purple-500 scale-105'
                                        : 'border-gray-200 hover:border-gray-300'
                                    } transition-all duration-200`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                            <Star className="h-3 w-3" />
                                            Más Popular
                                        </div>
                                    </div>
                                )}

                                {plan.id === 'starter' && (
                                    <div className="absolute -top-4 right-4">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                            ✓ Stripe Ready
                                        </div>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                                        <span className="text-gray-500">/mes</span>
                                    </div>
                                    <p className="text-gray-600 mt-2">{plan.requests} requests/mes</p>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <CheckCircle className={`h-4 w-4 ${feature.includes('Stripe') ? 'text-green-500' : 'text-emerald-500'
                                                }`} />
                                            <span className={`text-sm ${feature.includes('Stripe') ? 'text-green-700 font-medium' : 'text-gray-700'
                                                }`}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${billingData.currentPlan === plan.name
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg`
                                        }`}
                                    disabled={billingData.currentPlan === plan.name}
                                >
                                    {billingData.currentPlan === plan.name ? 'Plan Actual' : 'Seleccionar Plan'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'invoices' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 rounded-lg p-2">
                                <Download className="h-5 w-5 text-gray-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Historial de Facturas
                            </h2>
                        </div>
                        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Descargar Todo
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { date: '2025-10-01', amount: 45, status: 'paid' },
                            { date: '2025-09-01', amount: 45, status: 'paid' },
                            { date: '2025-08-01', amount: 45, status: 'paid' }
                        ].map((invoice, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 rounded-full p-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Factura #{String(index + 1).padStart(4, '0')}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(invoice.date).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-gray-900">€{invoice.amount}</span>
                                    <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                                        Descargar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
