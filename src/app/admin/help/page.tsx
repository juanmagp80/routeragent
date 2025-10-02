"use client";

import { 
    HelpCircle, 
    MessageSquare, 
    Mail, 
    Phone, 
    Book, 
    Code, 
    Zap, 
    Brain, 
    Search,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    PlayCircle,
    FileText,
    Users,
    Lightbulb,
    Star
} from "lucide-react";
import { useState } from "react";

const FAQ_DATA = [
    {
        id: 1,
        category: "Primeros Pasos",
        question: "¿Cómo crear mi primera API Key?",
        answer: "Navega a la sección 'API Keys' en tu dashboard, haz clic en 'Crear Nueva Key', dale un nombre descriptivo, selecciona tu plan y haz clic en 'Crear'. Tu nueva API key se generará y mostrará inmediatamente. ¡Guárdala en un lugar seguro!",
        popular: true
    },
    {
        id: 2,
        category: "Modelos IA",
        question: "¿Qué modelos de IA soporta RouterAI?",
        answer: "RouterAI soporta todos los modelos principales: GPT-4, GPT-4o, GPT-4o Mini, Claude-3, Claude-3.5 Sonnet, Gemini Pro, Gemini Flash, Llama-3, Mistral-7B, y muchos más. Nuestro router inteligente selecciona automáticamente el modelo óptimo para cada tarea.",
        popular: true
    },
    {
        id: 3,
        category: "Costos",
        question: "¿Cómo funciona la optimización de costos?",
        answer: "RouterAI utiliza algoritmos inteligentes de enrutamiento que analizan cada solicitud y seleccionan el modelo más cost-efectivo que cumple con los requerimientos de calidad. En promedio, los usuarios ahorran entre 70-95% comparado con usar modelos premium exclusivamente.",
        popular: true
    },
    {
        id: 4,
        category: "Facturación",
        question: "¿Cómo se cobra el servicio?",
        answer: "RouterAI ofrece planes flexibles: Starter (gratuito, 1k requests/mes), Pro (€29/mes, 5k requests/mes) y Enterprise (€99/mes, requests ilimitados). Solo pagas por lo que usas, con facturación mensual transparente."
    },
    {
        id: 5,
        category: "Seguridad",
        question: "¿Mis datos están seguros?",
        answer: "Absolutamente. RouterAI implementa encriptación end-to-end, no almacena contenido de requests, cumple con GDPR, y todas las comunicaciones usan TLS 1.3. Tus datos nunca se comparten con terceros."
    },
    {
        id: 6,
        category: "Rendimiento",
        question: "¿Qué tan rápido es RouterAI?",
        answer: "RouterAI añade menos de 50ms de latencia gracias a nuestra infraestructura global optimizada. Nuestro sistema de cache inteligente y selección de modelo en tiempo real garantiza respuestas ultra-rápidas."
    }
];

const RESOURCES = [
    {
        title: "Guía de Inicio Rápido",
        description: "Configura RouterAI en menos de 5 minutos",
        icon: Zap,
        type: "video",
        duration: "3 min",
        color: "yellow"
    },
    {
        title: "Documentación API",
        description: "Referencia completa de endpoints y ejemplos",
        icon: Code,
        type: "docs",
        pages: "24 páginas",
        color: "blue"
    },
    {
        title: "Mejores Prácticas",
        description: "Optimiza tu uso y reduce costos",
        icon: Lightbulb,
        type: "guide",
        time: "10 min",
        color: "purple"
    },
    {
        title: "Casos de Uso",
        description: "Ejemplos reales de implementación",
        icon: Users,
        type: "examples",
        count: "12 ejemplos",
        color: "green"
    }
];

export default function HelpPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    const categories = ['Todos', ...Array.from(new Set(FAQ_DATA.map(item => item.category)))];
    
    const filteredFAQ = FAQ_DATA.filter(item => {
        const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleFAQ = (id: number) => {
        setExpandedFAQ(expandedFAQ === id ? null : id);
    };

    return (
        <div className="space-y-8">
            {/* Page header con gradiente RouterAI */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl opacity-5"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 via-teal-50 to-cyan-100 rounded-2xl"></div>
                <div className="relative p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                                <HelpCircle className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent">
                                    Centro de Ayuda RouterAI
                                </h1>
                                <p className="mt-2 text-lg text-gray-600">
                                    Encuentra respuestas, guías y soporte experto
                                </p>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center space-x-4">
                            <div className="text-center">
                                <Brain className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                                <p className="text-sm text-gray-600">Asistente</p>
                                <p className="text-xl font-bold text-emerald-600">IA</p>
                            </div>
                            <div className="text-center">
                                <Users className="h-8 w-8 text-teal-500 mx-auto mb-1" />
                                <p className="text-sm text-gray-600">Soporte</p>
                                <p className="text-xl font-bold text-teal-600">24/7</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Busca en nuestra base de conocimiento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
            </div>

            {/* Quick Resources */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Recursos Rápidos</h2>
                            <p className="mt-1 text-gray-600">Guías y documentación para comenzar</p>
                        </div>
                        <Book className="h-8 w-8 text-emerald-500" />
                    </div>
                </div>
                
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {RESOURCES.map((resource, index) => (
                            <div key={index} className={`bg-gradient-to-br from-${resource.color}-50 to-${resource.color}-100 rounded-xl p-6 border border-${resource.color}-200 hover:shadow-lg transition-shadow cursor-pointer group`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 bg-${resource.color}-500 rounded-lg group-hover:scale-110 transition-transform`}>
                                        <resource.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                                <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                    {resource.type === 'video' && <PlayCircle className="h-3 w-3 mr-1" />}
                                    {resource.type === 'docs' && <FileText className="h-3 w-3 mr-1" />}
                                    {resource.type === 'guide' && <Lightbulb className="h-3 w-3 mr-1" />}
                                    {resource.type === 'examples' && <Users className="h-3 w-3 mr-1" />}
                                    <span>
                                        {resource.duration || resource.pages || resource.time || resource.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes</h2>
                            <p className="mt-1 text-gray-600">Respuestas a las consultas más comunes</p>
                        </div>
                        <MessageSquare className="h-8 w-8 text-teal-500" />
                    </div>
                </div>
                
                <div className="p-8">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* FAQ List */}
                    <div className="space-y-4">
                        {filteredFAQ.map((faq) => (
                            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleFAQ(faq.id)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        {faq.popular && <Star className="h-4 w-4 text-yellow-500" />}
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            faq.category === 'Primeros Pasos' ? 'bg-green-100 text-green-700' :
                                            faq.category === 'Modelos IA' ? 'bg-emerald-100 text-emerald-700' :
                                            faq.category === 'Costos' ? 'bg-teal-100 text-teal-700' :
                                            faq.category === 'Facturación' ? 'bg-yellow-100 text-yellow-700' :
                                            faq.category === 'Seguridad' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {faq.category}
                                        </span>
                                        <h3 className="font-medium text-gray-900">{faq.question}</h3>
                                    </div>
                                    {expandedFAQ === faq.id ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                                {expandedFAQ === faq.id && (
                                    <div className="px-6 pb-4">
                                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Contacta con Soporte</h2>
                            <p className="mt-1 text-gray-600">Nuestro equipo está aquí para ayudarte</p>
                        </div>
                        <Users className="h-8 w-8 text-cyan-500" />
                    </div>
                </div>
                
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-6 border border-emerald-200 hover:shadow-lg transition-shadow cursor-pointer group">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                                    <Mail className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                                    <p className="text-sm text-gray-600">support@routerai.com</p>
                                    <p className="text-xs text-emerald-600 mt-1">Respuesta en 2-4 horas</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-shadow cursor-pointer group">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                                    <MessageSquare className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Chat en Vivo</h3>
                                    <p className="text-sm text-gray-600">Disponible 24/7</p>
                                    <p className="text-xs text-green-600 mt-1">Respuesta inmediata</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl p-6 border border-teal-200 hover:shadow-lg transition-shadow cursor-pointer group">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-teal-500 rounded-lg group-hover:scale-110 transition-transform">
                                    <Phone className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Soporte Telefónico</h3>
                                    <p className="text-sm text-gray-600">+34 900 123 456</p>
                                    <p className="text-xs text-teal-600 mt-1">Lun-Vie 9:00-18:00</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-100 rounded-xl p-6 border border-emerald-200">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="h-6 w-6 text-emerald-500" />
                            <div>
                                <h3 className="font-semibold text-gray-900">Garantía de Satisfacción</h3>
                                <p className="text-gray-600 mt-1">
                                    Si no estás completamente satisfecho con RouterAI, ofrecemos reembolso completo en los primeros 30 días.
                                    Nuestro equipo de soporte está comprometido con tu éxito.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}