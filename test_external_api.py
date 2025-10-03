#!/usr/bin/env python3
"""
Script para probar RouterAI API desde sistema externo
"""

import requests
import json
import time

# Configuración
BASE_URL = "http://localhost:3000"
API_KEY = "ar_your_api_key_here"  # Reemplaza con tu API key real

def test_route_endpoint():
    """Probar endpoint /api/v1/route"""
    print("🧪 Probando endpoint /api/v1/route...")
    
    url = f"{BASE_URL}/api/v1/route"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    test_cases = [
        {
            "name": "Consulta General",
            "data": {
                "input": "¿Cuál es la capital de Francia?",
                "task_type": "general"
            }
        },
        {
            "name": "Resumen",
            "data": {
                "input": "RouterAI es una plataforma que optimiza el uso de modelos de IA mediante enrutamiento inteligente. Permite ahorrar costos significativos al seleccionar automáticamente el modelo más eficiente para cada tarea específica.",
                "task_type": "summary"
            }
        },
        {
            "name": "Traducción",
            "data": {
                "input": "Hello, how are you today?",
                "task_type": "translation"
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n📋 Test: {test_case['name']}")
        try:
            response = requests.post(url, headers=headers, json=test_case['data'], timeout=30)
            
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Éxito:")
                print(f"  - Modelo: {data.get('selected_model', 'N/A')}")
                print(f"  - Costo: ${data.get('cost', 0):.6f}")
                print(f"  - Tiempo: {data.get('estimated_time', 0)}ms")
                print(f"  - Respuesta: {data.get('response', 'N/A')[:100]}...")
            else:
                print(f"❌ Error: {response.text}")
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
        
        time.sleep(1)  # Pausa entre requests

def test_metrics_endpoint():
    """Probar endpoint /api/v1/metrics"""
    print("\n🧪 Probando endpoint /api/v1/metrics...")
    
    url = f"{BASE_URL}/api/v1/metrics"
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Métricas obtenidas:")
            
            # Resumen
            if 'summary' in data:
                summary = data['summary']
                print(f"  📊 Total requests: {summary.get('total_requests', 0)}")
                print(f"  💰 Costo total: ${summary.get('total_cost', 0):.6f}")
                print(f"  📈 Costo promedio: ${summary.get('avg_cost_per_request', 0):.6f}")
            
            # Modelos
            if 'metrics' in data:
                print("  🤖 Uso por modelo:")
                for metric in data['metrics'][:3]:  # Solo primeros 3
                    print(f"    - {metric.get('model', 'Unknown')}: {metric.get('count', 0)} requests")
                    
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.RequestException as e:
        print(f"❌ Error de conexión: {e}")

def test_api_health():
    """Verificar que la API está funcionando"""
    print("🏥 Verificando salud de la API...")
    
    try:
        # Probar endpoint básico
        response = requests.get(f"{BASE_URL}/api/v1/metrics", timeout=5)
        if response.status_code in [200, 401]:  # 401 es normal sin API key
            print("✅ API está respondiendo")
            return True
        else:
            print(f"❌ API respondió con código: {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ No se puede conectar a la API: {e}")
        print("💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000")
        return False

def main():
    """Ejecutar todas las pruebas"""
    print("🚀 RouterAI API External Test Suite")
    print("=" * 50)
    
    # Verificar conectividad
    if not test_api_health():
        print("\n❌ No se puede continuar sin conexión a la API")
        return
    
    # Ejecutar pruebas
    test_route_endpoint()
    test_metrics_endpoint()
    
    print("\n" + "=" * 50)
    print("✅ Pruebas completadas!")
    print("\n💡 Tips:")
    print("- Reemplaza 'ar_your_api_key_here' con tu API key real")
    print("- Asegúrate de que el servidor Next.js esté corriendo")
    print("- Usa diferentes task_types: general, summary, translation, analysis")

if __name__ == "__main__":
    main()