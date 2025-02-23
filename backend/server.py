from flask import Flask, request
import ai
app = Flask(__name__)

@app.route('/')
def home():
    return "Hello, World!"

@app.route('/getnumber')
def number():
    return {"number": "o"}

@app.route('/history', methods=['GET'])
def history():
    username = request.args.get('username')
    history = ai.get_user_chat(username)
    res = {
        "user": [pair["content"] for pair in history if pair["role"] == "user"],
        "ai": [pair["content"] for pair in history if pair["role"] == "assistant"],
    }
    print(res)
    return res

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    print(data)
    user = data.get('user')

    prompt = data.get('prompt')
    print(prompt)
    res = ai.chat_as(user, prompt)
    print(res)
    return res

@app.route('/question', methods=['GET'])
def question():
    data = request.get_json()
    user = data.get('user')
    topic = ai.str_to_topic.get(data.get('topic'))
    res = ai.question_about(user, topic)
    return res # string that is the question

@app.route('/answer', methods=['POST'])
def answer():
    data = request.get_json()
    user = data.get('user')
    answer = data.get('answer')
    topic = ai.str_to_topic.get(data.get('topic'))
    res = ai.capture_structured_input(user, answer, topic)
    return res # string that is the response

@app.route('/explain', methods=['GET'])
def explain():
    data = request.get_json()
    user = data.get('user')
    topic = ai.str_to_topic.get(data.get('topic'))
    res = ai.explain(user, topic)
    return res # string that is the explanation



if __name__ == '__main__':
    app.run(debug=True)