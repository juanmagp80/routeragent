"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle,
  Code,
  DollarSign,
  Network,
  RefreshCw,
  Target,
  Timer,
  TrendingDown
} from "lucide-react";
import { useEffect, useState } from "react";

// Componente de navegación minimalista y única
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        isScrolled
          ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg rotate-12 absolute"></div>
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center relative">
                <Network className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black text-white">RouterAI</span>
              <div className="text-xs text-emerald-400 font-mono">AI</div>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#router" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Router</a>
            <a href="#ahorro" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Ahorro</a>
            <a href="#dashboard" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Dashboard</a>
            <a href="/docs" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">API Docs</a>
            <a href="#precios" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Precios</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/login"
              className="text-slate-300 hover:text-emerald-400 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-slate-800/50"
            >
              Iniciar Sesión
            </a>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05, backgroundColor: "#10b981" }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-500 text-slate-900 px-6 py-2 rounded-lg font-bold shadow-lg transition-all duration-300"
            >
              Registrarse
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

// Hero con estilo terminal/código
const HeroSection = () => {
  const [typedText, setTypedText] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const fullText = "curl -X POST https://api.routerai.com/v1/route";

  useEffect(() => {
    if (currentStep < fullText.length) {
      const timer = setTimeout(() => {
        setTypedText(fullText.slice(0, currentStep + 1));
        setCurrentStep(currentStep + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, fullText]);

  return (
    <section className="min-h-screen bg-slate-900 text-white flex items-center relative overflow-hidden pt-20">
      {/* Animated circuit lines */}
      <div className="absolute inset-0 z-0">
        <svg className="w-full h-full opacity-20">
          <defs>
            <linearGradient id="circuit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,200 Q400,100 800,200 T1600,200"
            stroke="url(#circuit)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,400 Q600,300 1200,400 T2400,400"
            stroke="url(#circuit)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-5rem)]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="order-2 lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-8"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-emerald-400 font-mono text-sm">Router activo • Optimizando costos</span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-none">
              <span className="text-white">Router</span>
              <br />
              <span className="text-emerald-400">Inteligente</span>
              <br />
              <span className="text-slate-400 text-4xl lg:text-5xl">de IA</span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              API que elige automáticamente el modelo de IA más eficiente para cada tarea.
              <span className="text-emerald-400 font-semibold">Ahorra hasta 70%</span> en costos
              sin sacrificar calidad.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(16, 185, 129, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-emerald-500 text-slate-900 px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-emerald-400 transition-all duration-300 flex items-center justify-center group"
              >
                Probar Gratis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.a
                href="/docs"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-slate-600 text-slate-300 px-8 py-4 rounded-lg font-bold text-lg hover:border-emerald-500 hover:text-emerald-400 transition-all duration-300 inline-flex items-center justify-center"
              >
                Ver Documentación
              </motion.a>
            </div>

            {/* Stats en formato terminal */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { label: "Ahorro promedio", value: "70%", color: "text-emerald-400" },
                { label: "Tiempo de respuesta", value: "<100ms", color: "text-blue-400" },
                { label: "Modelos soportados", value: "15+", color: "text-purple-400" },
                { label: "Uptime SLA", value: "99.9%", color: "text-orange-400" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                >
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-slate-400 text-sm font-mono">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Terminal simulado */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative order-1 lg:order-2"
          >
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
              {/* Terminal header */}
              <div className="bg-slate-700 px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-400 text-sm font-mono ml-4">routerai-api</span>
              </div>

              {/* Terminal content */}
              <div className="p-6 font-mono text-sm">
                <div className="text-emerald-400 mb-2">$ {typedText}<span className="animate-pulse">|</span></div>
                <div className="text-slate-400 mb-4">
                  {currentStep >= fullText.length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="text-blue-400">→ Analizando tarea...</div>
                      <div className="text-yellow-400">→ Evaluando modelos disponibles...</div>
                      <div className="text-emerald-400">→ Modelo óptimo: Claude-3 (costo: $0.003)</div>
                      <div className="text-green-400">✓ Respuesta generada • Ahorro: 68%</div>
                    </motion.div>
                  )}
                </div>

                {currentStep >= fullText.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                    className="bg-slate-700 rounded p-4 border-l-4 border-emerald-500"
                  >
                    <div className="text-emerald-400 text-xs mb-2">RESPONSE</div>
                    <div className="text-white">
                      "Resumen del documento generado exitosamente..."
                    </div>
                    <div className="text-slate-400 text-xs mt-2">
                      Cost: $0.003 • Model: Claude-3 • Time: 89ms
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Sección de router con estilo técnico
const RouterSection = () => {
  return (
    <section id="router" className="py-24 bg-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            El Router que <span className="text-emerald-600">Piensa</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Tecnología avanzada que analiza tu tarea y elige el modelo perfecto basándose en costo, velocidad y calidad.
          </p>
        </motion.div>

        {/* Diagrama de decisión único */}
        <div className="relative bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-slate-900 rounded-xl p-6 mb-4">
                <Code className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <div className="text-white font-mono text-sm">
                  POST /v1/route
                </div>
                <div className="text-slate-400 text-xs mt-2">
                  {"{ task: 'Resume PDF' }"}
                </div>
              </div>
              <h3 className="font-bold text-slate-900">Tu Tarea</h3>
            </motion.div>

            {/* Router Logic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-emerald-500 rounded-xl p-6 mb-4 relative overflow-hidden">
                <Brain className="w-12 h-12 text-white mx-auto mb-4" />
                <div className="text-white font-bold">RouterAI</div>
                <div className="text-emerald-100 text-xs mt-2">
                  Analizando...
                </div>

                {/* Animated thinking dots */}
                <div className="absolute top-2 right-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                </div>
              </div>

              {/* Decision factors */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">Costo</div>
                <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">Velocidad</div>
                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">Calidad</div>
              </div>
            </motion.div>

            {/* Output */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 mb-4">
                <Target className="w-12 h-12 text-white mx-auto mb-4" />
                <div className="text-white font-bold">Claude-3</div>
                <div className="text-blue-100 text-xs mt-2">
                  Óptimo para esta tarea
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold mt-2">
                  68% más barato
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Sección de ahorro con estilo financiero
const SavingsSection = () => {
  const [selectedModel, setSelectedModel] = useState("gpt4");

  const models = {
    gpt4: { name: "Solo GPT-4", cost: 1000, color: "text-red-500" },
    mixed: { name: "Con RouterAI", cost: 320, color: "text-emerald-500" }
  };

  return (
    <section id="ahorro" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            Ahorro <span className="text-emerald-600">Real</span> y <span className="text-emerald-600">Medible</span>
          </h2>
          <p className="text-xl text-slate-600">
            Comparativa real de costos: antes vs después de RouterAI
          </p>
        </motion.div>

        {/* Comparativa visual única */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Antes */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-700">ANTES</h3>
                <p className="text-red-600">Usando solo un modelo</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Costo mensual</span>
                    <span className="text-2xl font-bold text-red-600">$3,200</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Eficiencia</span>
                    <span className="text-red-600 font-bold">Baja</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Optimización</span>
                    <span className="text-red-600 font-bold">Manual</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Después */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-8 h-8 text-white rotate-180" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-700">DESPUÉS</h3>
                <p className="text-emerald-600">Con RouterAI</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Costo mensual</span>
                    <span className="text-2xl font-bold text-emerald-600">$960</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Eficiencia</span>
                    <span className="text-emerald-600 font-bold">Máxima</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Optimización</span>
                    <span className="text-emerald-600 font-bold">Automática</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge de ahorro */}
            <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-6 py-3 rounded-full font-black text-lg shadow-lg transform rotate-12">
              ¡$2,240 ahorrados!
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Componente de Dashboard con métricas en tiempo real
const DashboardSection = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/metrics');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMetrics(data.metrics || []);
        setSummary(data.summary || {});
        setRecentTasks(data.recent_tasks || []);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);

      // Usar datos mock como fallback para la demo
      console.log('Using fallback mock data for demo...');
      setMetrics([
        { model: "gpt-4o", count: 45, sum: 0.675 },
        { model: "claude-3", count: 23, sum: 0.69 },
        { model: "gpt-4o-mini", count: 67, sum: 0.134 },
        { model: "llama-3", count: 89, sum: 0.089 }
      ]);
      setSummary({
        total_cost: 1.588,
        total_requests: 224,
        avg_cost_per_request: 0.007
      });
      setRecentTasks([
        {
          model: "claude-3",
          cost: 0.015,
          latency: 89,
          status: "completed",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          model: "gpt-4o",
          cost: 0.032,
          latency: 156,
          status: "completed",
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
        }
      ]);
      setLastUpdated(new Date());
      setError(null); // No mostrar error, usar datos mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const totalCost = summary.total_cost || 0;
  const totalRequests = summary.total_requests || 0;
  const avgCostPerRequest = summary.avg_cost_per_request || 0;

  return (
    <section id="dashboard" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            Dashboard <span className="text-emerald-600">de Métricas</span>
          </h2>
          <p className="text-xl text-slate-600">
            Visualiza en tiempo real tu uso de IA y ahorros
          </p>

          <div className="mt-6 flex justify-center items-center space-x-4">
            <div className="flex items-center">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm text-slate-500">
                {lastUpdated ? `Actualizado: ${lastUpdated.toLocaleTimeString()}` : 'Cargando...'}
              </span>
            </div>
            <button
              onClick={fetchMetrics}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              Refrescar
            </button>
          </div>
        </motion.div>

        {/* Resumen de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Costo</p>
                <p className="text-3xl font-bold text-slate-900">${totalCost.toFixed(3)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Tareas</p>
                <p className="text-3xl font-bold text-slate-900">{totalRequests}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Costo Promedio</p>
                <p className="text-3xl font-bold text-emerald-600">${avgCostPerRequest.toFixed(4)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gráfico de uso por modelo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-12"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
            Uso por Modelo
          </h3>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchMetrics}
                className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : metrics.length > 0 ? (
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                    <span className="font-medium text-slate-900">{metric.model}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-slate-600">
                      {metric.count || 0} tareas
                    </div>
                    <div className="text-sm font-bold text-emerald-600">
                      ${metric.sum?.toFixed(2) || '0.00'}
                    </div>
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (metric.sum || 0) / (totalCost || 1) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No hay datos disponibles aún
            </div>
          )}
        </motion.div>

        {/* Últimas tareas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-emerald-600" />
            Últimas Tareas
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Modelo</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Costo</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Tiempo</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task, index) => (
                  <tr key={index} className={index < recentTasks.length - 1 ? "border-b border-slate-100" : ""}>
                    <td className="py-4 px-4 font-medium text-slate-900 capitalize">{task.model}</td>
                    <td className="py-4 px-4 text-emerald-600 font-bold">${task.cost.toFixed(3)}</td>
                    <td className="py-4 px-4 text-slate-600">{task.latency}ms</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {task.status === 'completed' ? 'Completado' : 'Procesando'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Precios con estilo más técnico
const PricingSection = () => {
  return (
    <section id="precios" className="py-24 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black mb-4">
            Precios <span className="text-emerald-400">Simples</span>
          </h2>
          <p className="text-xl text-slate-400">
            $0.01 por tarea + costo del modelo. Sin sorpresas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Starter",
              price: "$29",
              tasks: "1,000 tareas",
              features: ["Dashboard básico", "Todos los modelos", "Soporte email"],
              highlight: false
            },
            {
              name: "Pro",
              price: "$99",
              tasks: "5,000 tareas",
              features: ["Prioridad en router", "Dashboard avanzado", "Soporte prioritario", "API webhooks"],
              highlight: true
            },
            {
              name: "Enterprise",
              price: "Custom",
              tasks: "Ilimitadas",
              features: ["SLA dedicado", "Integración custom", "Soporte 24/7", "On-premise"],
              highlight: false
            }
          ].map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-2xl p-8 border-2 transition-all duration-300",
                plan.highlight
                  ? "bg-emerald-500 border-emerald-400 shadow-2xl shadow-emerald-500/20"
                  : "bg-slate-800 border-slate-700 hover:border-slate-600"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-900 text-emerald-400 px-4 py-1 rounded-full text-sm font-bold">
                  RECOMENDADO
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={cn(
                  "text-2xl font-black mb-2",
                  plan.highlight ? "text-slate-900" : "text-white"
                )}>
                  {plan.name}
                </h3>
                <div className={cn(
                  "text-4xl font-black mb-2",
                  plan.highlight ? "text-slate-900" : "text-emerald-400"
                )}>
                  {plan.price}
                </div>
                <div className={cn(
                  "text-sm font-mono",
                  plan.highlight ? "text-slate-700" : "text-slate-400"
                )}>
                  {plan.tasks}/mes
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className={cn(
                      "w-5 h-5 mr-3",
                      plan.highlight ? "text-slate-700" : "text-emerald-400"
                    )} />
                    <span className={cn(
                      "font-medium",
                      plan.highlight ? "text-slate-800" : "text-slate-300"
                    )}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-full py-4 rounded-lg font-bold text-lg transition-all duration-300",
                  plan.highlight
                    ? "bg-slate-900 text-emerald-400 hover:bg-slate-800"
                    : "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                )}
              >
                {plan.name === "Enterprise" ? "Contactar" : "Empezar"}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Nota técnica */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center px-6 py-3 bg-slate-800 border border-slate-700 rounded-full">
            <Timer className="w-4 h-4 text-emerald-400 mr-2" />
            <span className="text-slate-300 font-mono text-sm">
              Integración: cambiar 1 línea de código • Tiempo: &lt;10 minutos
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Testimonios con estilo más auténtico
const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            Lo que Dicen los <span className="text-emerald-600">Developers</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              name: "Alex Chen",
              role: "Senior Backend Engineer",
              company: "TechCorp",
              content: "Literalmente cambié una línea de código y empecé a ahorrar $2K al mes. El router es increíblemente inteligente.",
              savings: "$2,000/mes",
              tech: "Node.js + Express"
            },
            {
              name: "Sofia Rodriguez",
              role: "ML Engineer",
              company: "DataFlow",
              content: "El dashboard me permite ver exactamente qué modelo es mejor para cada tipo de tarea. Data-driven decisions.",
              savings: "65% optimización",
              tech: "Python + FastAPI"
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-slate-600 text-sm">{testimonial.role}</p>
                  <p className="text-slate-500 text-xs font-mono">{testimonial.tech}</p>
                </div>
              </div>

              <blockquote className="text-slate-700 mb-6 italic border-l-4 border-emerald-500 pl-4">
                "{testimonial.content}"
              </blockquote>

              <div className="bg-emerald-100 border border-emerald-200 rounded-lg p-4 text-center">
                <div className="text-emerald-700 font-bold text-lg">{testimonial.savings}</div>
                <div className="text-emerald-600 text-sm">ahorrados</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer minimalista
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-8 md:mb-0">
            <div className="relative">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg rotate-12 absolute"></div>
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center relative border border-slate-700">
                <Network className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black">RouterAI</span>
              <div className="text-xs text-slate-400 font-mono">v1.0.0</div>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <a href="/docs" className="text-slate-400 hover:text-emerald-400 transition-colors font-mono text-sm">
              API Docs
            </a>
            <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors font-mono text-sm">
              GitHub
            </a>
            <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors font-mono text-sm">
              Status
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm font-mono">
            © 2024 RouterAI • Optimizando IA desde 2024
          </p>
        </div>
      </div>
    </footer>
  );
};

// Componente principal
export default function Home() {
  return (
    <main className="relative">
      <Navigation />
      <HeroSection />
      <RouterSection />
      <SavingsSection />
      <DashboardSection />
      <PricingSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
