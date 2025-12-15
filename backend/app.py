# Feito por Gustavo Bezerra
import os
import re
import json
import hashlib
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)

ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    os.environ.get('FRONTEND_URL', 'https://nexus-dashboard.onrender.com')
]

CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
ALLOWED_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
]

rate_limit_store = {}
RATE_LIMIT_REQUESTS = 10
RATE_LIMIT_WINDOW = 60


def get_client_ip():
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    return request.remote_addr


def check_rate_limit():
    client_ip = get_client_ip()
    now = datetime.now()
    
    if client_ip not in rate_limit_store:
        rate_limit_store[client_ip] = []
    
    rate_limit_store[client_ip] = [
        ts for ts in rate_limit_store[client_ip] 
        if now - ts < timedelta(seconds=RATE_LIMIT_WINDOW)
    ]
    
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT_REQUESTS:
        return False
    
    rate_limit_store[client_ip].append(now)
    return True


def rate_limit_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not check_rate_limit():
            return jsonify({
                'error': 'Rate limit exceeded',
                'message': f'Maximum {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds'
            }), 429
        return f(*args, **kwargs)
    return decorated_function


def validate_gemini_payload(data):
    if not isinstance(data, dict):
        return False, 'Payload must be a JSON object'
    
    if 'contents' not in data:
        return False, 'Missing required field: contents'
    
    if not isinstance(data['contents'], list):
        return False, 'Contents must be an array'
    
    for content in data['contents']:
        if not isinstance(content, dict):
            return False, 'Each content item must be an object'
        if 'parts' not in content:
            return False, 'Each content item must have parts'
    
    return True, None


def sanitize_input(text):
    if not isinstance(text, str):
        return str(text)
    
    dangerous_patterns = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
    ]
    
    result = text
    for pattern in dangerous_patterns:
        result = re.sub(pattern, '', result, flags=re.IGNORECASE | re.DOTALL)
    
    return result[:10000]


@app.before_request
def before_request():
    g.request_id = secrets.token_hex(8)
    g.start_time = datetime.now()


@app.after_request
def after_request(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    if hasattr(g, 'request_id'):
        response.headers['X-Request-ID'] = g.request_id
    
    return response


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'api_configured': bool(GEMINI_API_KEY)
    })


@app.route('/api/gemini-proxy', methods=['POST'])
@rate_limit_required
def gemini_proxy():
    if not GEMINI_API_KEY:
        return jsonify({'error': 'API key not configured'}), 500
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Empty request body'}), 400
        
        is_valid, error_msg = validate_gemini_payload(data)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        model = data.pop('model', 'gemini-2.5-flash')
        if model not in ALLOWED_MODELS:
            model = 'gemini-2.5-flash'
        
        for content in data.get('contents', []):
            for part in content.get('parts', []):
                if 'text' in part:
                    part['text'] = sanitize_input(part['text'])
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        
        headers = {'Content-Type': 'application/json'}
        
        response = requests.post(url, headers=headers, json=data, timeout=45)
        
        return jsonify(response.json()), response.status_code
    
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timeout'}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'External API error'}), 502
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON'}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/models', methods=['GET'])
def get_models():
    return jsonify({'models': ALLOWED_MODELS, 'default': 'gemini-2.5-flash'})


@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Method not allowed'}), 405


@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"\n{'='*60}")
    print("Nexus Dashboard - Backend Server")
    print(f"{'='*60}")
    print(f"Port: {port}")
    print(f"API Key: {'Configured' if GEMINI_API_KEY else 'NOT CONFIGURED'}")
    print(f"Allowed Origins: {ALLOWED_ORIGINS}")
    print(f"{'='*60}\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
