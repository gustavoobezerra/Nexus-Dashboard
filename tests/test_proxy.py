import unittest
import json
from unittest.mock import patch, MagicMock
from proxy_server import app

class TestProxyServer(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    @patch('proxy_server.requests.post')
    @patch('proxy_server.GEMINI_API_KEY', 'test_key')
    def test_gemini_proxy_success(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"candidates": [{"content": {"parts": [{"text": "Success"}]}}]}
        mock_post.return_value = mock_response

        payload = {
            "model": "gemini-2.5-flash",
            "contents": [{"parts": [{"text": "Hello"}]}]
        }

        response = self.app.post('/api/gemini-proxy',
                                 data=json.dumps(payload),
                                 content_type='application/json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"candidates": [{"content": {"parts": [{"text": "Success"}]}}]})

        # Verify correct model URL was called
        args, _ = mock_post.call_args
        self.assertIn("models/gemini-2.5-flash:generateContent", args[0])

    @patch('proxy_server.requests.post')
    @patch('proxy_server.GEMINI_API_KEY', 'test_key')
    def test_gemini_proxy_default_model(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {}
        mock_post.return_value = mock_response

        payload = {
            "contents": [{"parts": [{"text": "Hello"}]}]
        }

        response = self.app.post('/api/gemini-proxy',
                                 data=json.dumps(payload),
                                 content_type='application/json')

        self.assertEqual(response.status_code, 200)

        # Verify default model is gemini-2.5-flash
        args, _ = mock_post.call_args
        self.assertIn("models/gemini-2.5-flash:generateContent", args[0])

    @patch('proxy_server.GEMINI_API_KEY', None)
    def test_gemini_proxy_no_key(self):
        response = self.app.post('/api/gemini-proxy',
                                 data=json.dumps({}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 500)
        self.assertIn("API Key não configurada", response.json['error'])

if __name__ == '__main__':
    unittest.main()
