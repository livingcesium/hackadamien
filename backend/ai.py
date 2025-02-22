import os
from groq import Groq
import json
from validation import Validator, Sandwich

# Initialize the Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
model = "deepseek-r1-distill-llama-70b"
data = {}


def load_user(user: str):
    global data
    try:
        with open('data/{}.json'.format(user), 'r') as file:
            data[user] = json.load(file)
    except FileNotFoundError:
        data[user] = []
    except json.JSONDecodeError:
        data[user] = []
def save_user(user: str):
    global data
    with open('data/{}.json'.format(user), 'w+') as file:
        json.dump(data[user], file)

def get_user_chat(user : str):
    load_user(user)
    if user not in data:
        data[user] = []
    return data[user]

def use_model(name: str):
    global model
    model = name

def chat_as(user: str, content: str):
    history = get_user_chat(user) + [{"role": "user", "content": content}]
    chat_completion = client.chat.completions.create(
        messages=history,
        model=model,
    )

    data[user] = history + [chat_completion.choices[0].message.to_dict()]
    save_user(user)

def get_structured_response(user: str, sys_prompt: str, msgs: list = [], save: bool = False):
    load_user(user)
    history = data[user] + [{"role": "system", "content": sys_prompt}]
    completion = client.chat.completions.create(
        model=model,
        messages=history + msgs,
        response_format={"type": "json_object"},
        reasoning_format= "hidden",
        temperature=0,
    )
    if save:
        data[user] = history + [completion.choices[0].message.to_dict()]
        save_user(user)
    return json.loads(completion.choices[0].message.content)


def explain(user: str, topic: Validator):
    system_prompt = f"""Explain the following topic to the user:
    details: {topic.requirements()}"""
    history = get_user_chat(user) + [{"role": "system", "content": system_prompt}]
    pass

def question_about(user: str, topic: Validator):
    system_prompt = f"""Using the conversation so far as context, gauge the user's
    understanding about the following topic:
    details: {topic.requirements()}
    challenge: {topic.challenge()}

    Don't tell the user any of these details.
    Respond with an example scenario that and ask the user to reply
    with a completion that matches the schema. Do not reply until you have a valid question to ask
    Do NOT provide general advice, stick to the schema and QUIZ THE USER.
    Make sure the user is challenged according to their performance, and ensure you include your question always.
    
    Create example questions before deciding on the final one.

    Your response must be in valid JSON format and include the following fields:
    question: str
    new_examples: list[str]
    """
    
    resp = get_structured_response(user, system_prompt, [{"role": "system", "content": system_prompt}])
    
    #save_user(user)
    print(resp)

def capture_structured_input(user: str, input: str, item: Validator):
    system_prompt = f"""Extract information from the text and return as JSON matching this schema:
    schema: {item.requirements()}
    """
    response = get_structured_response(user, system_prompt, [{"role": "user", "content": input}])
    if "details" in response: 
        del response["details"]

    print(response)
    data[user] = get_user_chat(user) + [{"role": "user", "content": response.get("msg", "")}]

    # try:
    #     item = item.validate(completion.choices[0].message.to_dict())
    # except ValueError as e:
    #     data[user] = msgs + [{"role": "system", "content": f"Error: {e}"}]
    #     save_data()
    #     return
    # save_user(user)




capture_structured_input("test3", "Yes, it is valid.", Sandwich())
#question_about("test3", Sandwich())


