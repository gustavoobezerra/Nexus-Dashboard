import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env (para desenvolvimento local)
load_dotenv()

# A chave de API deve ser carregada de uma variável de ambiente
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

if not GEMINI_API_KEY or GEMINI_API_KEY == 'SUA_CHAVE_AQUI':
    print("=" * 70)
    print("ERRO: API Key do Google Gemini nao configurada!")
    print("=" * 70)
    print("\nPara corrigir:")
    print("   1. Abra o arquivo '.env' na raiz do projeto")
    print("   2. Substitua 'SUA_CHAVE_AQUI' pela sua chave real")
    print("   3. Obtenha sua chave em: https://makersuite.google.com/app/apikey")
    print("=" * 70)
    # Em produção, pode ser melhor não sair, mas logar erro.
    # Mas sem chave, o proxy não funciona.
    # exit(1)

app = Flask(__name__)
# Permite que o frontend (que estará em http://localhost:8000) acesse este backend (http://localhost:5000)
CORS(app)

# Lista de modelos permitidos para segurança
ALLOWED_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-exp-1206"
]

@app.route('/api/gemini-proxy', methods=['POST'])
def gemini_proxy():
    """
    Endpoint que recebe a requisição do frontend e a repassa para a API do Gemini,
    adicionando a chave de API de forma segura.
    """
    if not GEMINI_API_KEY:
        return jsonify({"error": "API Key não configurada no servidor."}), 500

    try:
        # 1. Obter os dados (payload) da requisição do frontend
        data = request.get_json()

        # 2. Definir o modelo
        # Tenta pegar do corpo da requisição, senão usa o padrão
        requested_model = data.get('model', "gemini-2.5-flash")

        # Validação de segurança: verificar se o modelo está na lista permitida
        if requested_model not in ALLOWED_MODELS:
            # Se não estiver na lista, usa o padrão ou retorna erro.
            # Vamos usar o padrão seguro.
            model = "gemini-2.5-flash"
        else:
            model = requested_model

        # Remove o campo 'model' do payload antes de enviar para o Gemini,
        # pois a API do Gemini não espera isso no corpo (o modelo vai na URL)
        # Mas 'contents' e 'generationConfig' são esperados.
        gemini_payload = {k: v for k, v in data.items() if k != 'model'}

        # 3. Construir a URL da API do Gemini
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"

        # 4. Configurar os headers
        headers = {
            "Content-Type": "application/json"
        }

        # 5. Fazer a requisição para a API do Gemini
        response = requests.post(url, headers=headers, json=gemini_payload, timeout=40)

        # 6. Retornar a resposta do Gemini diretamente para o frontend
        if response.status_code != 200:
             # Logar erro mas não expor detalhes sensíveis se houver
            print(f"Erro na API Gemini: {response.status_code} - {response.text}")
            return jsonify(response.json()), response.status_code

        return jsonify(response.json()), response.status_code

    except requests.exceptions.Timeout:
        return jsonify({"error": "Tempo limite de requisição excedido."}), 504
    except Exception as e:
        print(f"Erro no proxy: {e}")
        return jsonify({"error": "Erro interno do servidor proxy."}), 500

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("Nexus Dashboard - Proxy Server Iniciado!")
    print("=" * 70)
    # Removida a exibição da chave de API por segurança
    print("Servidor rodando em: http://localhost:5000")
    print("Endpoint: http://localhost:5000/api/gemini-proxy")
    print("\nProximos passos:")
    print("   1. Mantenha esta janela aberta")
    print("   2. Abra o arquivo 'index.html' no navegador")
    print("   3. Use o dashboard normalmente!")
    print("\nPressione Ctrl+C para parar o servidor")
    print("=" * 70 + "\n")

    # O servidor Flask rodará na porta 5000
    app.run(host='0.0.0.0', port=5000, debug=False)
