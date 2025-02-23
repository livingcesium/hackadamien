from flask import Flask, request, jsonify
from flask_cors import CORS
import ai
from http import HTTPStatus
from functools import wraps

app = Flask(__name__)
CORS(app)

def validate_request(*required_fields):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.method == 'POST':
                data = request.get_json()
                if not data:
                    return jsonify({"error": "No data provided"}), HTTPStatus.BAD_REQUEST
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    return jsonify({"error": f"Missing required fields: {missing_fields}"}), HTTPStatus.BAD_REQUEST
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@app.route('/history')
@validate_request('username')
def history():
    try:
        username = request.args.get('username')
        history = ai.get_user_chat(username)
        return jsonify({
            "user": [pair["content"] for pair in history if pair["role"] == "user"],
            "ai": [pair["content"] for pair in history if pair["role"] == "assistant"],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route('/chat', methods=['POST'])
@validate_request('user', 'prompt')
def chat():
    try:
        data = request.get_json()
        print("Received request:", data)
        
        res = ai.chat_as(data['user'], data['prompt'])
        print("Got response:", res)
        
        return jsonify({"response": res})
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR
    
@app.route('/question', methods=['POST'])  # Changed from GET to POST
@validate_request('user', 'topic')
def question():
    try:
        data = request.get_json()
        user = data['user']
        topic = ai.str_to_topic.get(data['topic'])
        if not topic:
            return jsonify({"error": "Invalid topic"}), HTTPStatus.BAD_REQUEST
        res = ai.question_about(user, topic)
        return jsonify({"question": res})
    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route('/explain', methods=['POST'])  # Changed from GET to POST
@validate_request('user', 'topic')
def explain():
    try:
        data = request.get_json()
        user = data['user']
        topic = ai.str_to_topic.get(data['topic'])
        if not topic:
            return jsonify({"error": "Invalid topic"}), HTTPStatus.BAD_REQUEST
        res = ai.explain(user, topic)
        return jsonify({"explanation": res})
    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR
    
@app.route('/answer', methods=['POST'])
@validate_request('user', 'answer', 'topic')
def answer():
    try:
        data = request.get_json()
        user = data['user']
        answer = data['answer']
        topic = ai.str_to_topic.get(data['topic'])
        if not topic:
            return jsonify({"error": "Invalid topic"}), HTTPStatus.BAD_REQUEST
        res = ai.capture_structured_input(user, answer, topic)
        return jsonify({"response": res})
    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Specify port explicitly for frontend reference