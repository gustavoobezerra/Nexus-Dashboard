import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

# A chave de API deve ser carregada de uma variável de ambiente
# Isso é mais seguro do que embutir no código, mesmo no backend.
# Para testes locais, você pode definir a variável de ambiente no terminal:
# export GEMINI_API_KEY='AIzaSyCx7j-ViLMmzchjJcIh-3X5YTWx6rpsYxk'
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    print("ERRO: A variável de ambiente GEMINI_API_KEY não está definida.")
    print("Defina-a com sua chave de API antes de rodar o servidor.")
    exit()

app = Flask(__name__)
# Permite que o frontend (que estará em http://localhost:8000) acesse este backend (http://localhost:5000)
CORS(app) 

@app.route('/api/gemini-proxy', methods=['POST'])
def gemini_proxy():
    """
    Endpoint que recebe a requisição do frontend e a repassa para a API do Gemini,
    adicionando a chave de API de forma segura.
    """
    try:
        # 1. Obter os dados (payload) da requisição do frontend
        data = request.get_json()
        
        
      # 2. Definir o modelo (usando o modelo mais recente que o usuário confirmou)
        model = "gemini-2.5-flash"

        
        # 3. Construir a URL da API do Gemini
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        
        # 4. Configurar os headers
        headers = {
            "Content-Type": "application/json"
        }
        
        # 5. Fazer a requisição para a API do Gemini
        response = requests.post(url, headers=headers, json=data, timeout=40)
        
        # 6. Retornar a resposta do Gemini diretamente para o frontend
        return jsonify(response.json()), response.status_code

    except requests.exceptions.Timeout:
        return jsonify({"error": "Tempo limite de requisição excedido."}), 504
    except Exception as e:
        print(f"Erro no proxy: {e}")
        return jsonify({"error": "Erro interno do servidor proxy."}), 500

if __name__ == '__main__':
    # O servidor Flask rodará na porta 5000
    app.run(port=5000)
