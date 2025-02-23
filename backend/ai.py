import os
from groq import Groq
import json
from validation import Validator, Sandwich, Calculus
from threading import Lock
import logging

class AIManager:
    def __init__(self):
        self.client = Groq(api_key='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')
        self.model = "deepseek-r1-distill-llama-70b"
        self.data = {}
        self.data_lock = Lock()
        self.str_to_topic = {
            "sandwich": Sandwich(),
            "calculus": Calculus()
        }

    def load_user(self, user: str):
        with self.data_lock:
            try:
                file_path = os.path.join('data', f'{user}.json')
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                with open(file_path, 'r') as file:
                    self.data[user] = json.load(file)
            except FileNotFoundError:
                self.data[user] = []
            except json.JSONDecodeError:
                logging.error(f"Corrupted data file for user {user}")
                self.data[user] = []

    def save_user(self, user: str):
        with self.data_lock:
            file_path = os.path.join('data', f'{user}.json')
            try:
                # Debug print before saving
                print(f"Trying to save data: {self.data[user]}")
                with open(file_path, 'w') as file:
                    json.dump(self.data[user], file)
                print(f"Successfully saved to {file_path}")
            except Exception as e:
                print(f"Error saving user data: {str(e)}")
                
    def chat_as(self, user: str, content: str):
        try:
            print("1. Getting chat history...")
            history = self.get_user_chat(user) + [{"role": "user", "content": content}]
            print("2. History loaded:", history)
            
            print("3. Starting Groq API call...")
            chat_completion = self.client.chat.completions.create(
                messages=history,
                model=self.model,
                reasoning_format="hidden",
                max_tokens=250,  # Limit response length
                timeout=30  # Add timeout of 30 seconds
            )
            print("4. Groq API responded")
            
            res = chat_completion.choices[0].message.to_dict()
            print("5. Processing response:", res)
            
            self.data[user] = history + [res]
            self.save_user(user)
            print("6. Saved to user history")
            
            return res["content"]
        except Exception as e:
            print(f"Error in chat_as: {str(e)}")
            raise

    def get_structured_response(self, user: str, sys_prompt: str, msgs: list = [], save: bool = False):
        with self.data_lock:
            self.load_user(user)
            history = self.data[user] + [{"role": "system", "content": sys_prompt}]
            try:
                completion = self.client.chat.completions.create(
                    model=self.model,
                    messages=history + msgs,
                    response_format={"type": "json_object"},
                    reasoning_format="hidden",
                    temperature=0,
                )
                if save:
                    self.data[user] = history + [completion.choices[0].message.to_dict()]
                    self.save_user(user)
                return json.loads(completion.choices[0].message.content)
            except Exception as e:
                logging.error(f"Structured response error for user {user}: {str(e)}")
                raise
    def get_user_chat(self, user: str):
        print(f"Starting get_user_chat for user: {user}")
        with self.data_lock:
            print("Got lock, trying to load user...")
            try:
                file_path = os.path.join('data', f'{user}.json')
                print(f"Checking file: {file_path}")
                
                if not os.path.exists(file_path):
                    print(f"No history file found for {user}, creating new history")
                    self.data[user] = []
                    return self.data[user]
                
                print(f"Loading history file for {user}")
                try:
                    with open(file_path, 'r') as file:
                        content = file.read()
                        print(f"Raw file content: {content}")  # See what's in the file
                        self.data[user] = json.loads(content)
                    print(f"Successfully loaded history for {user}")
                except json.JSONDecodeError as e:
                    print(f"JSON decode error: {str(e)}. Resetting history.")
                    self.data[user] = []
                except Exception as e:
                    print(f"File read error: {str(e)}. Resetting history.")
                    self.data[user] = []
                
                return self.data[user]
                
            except Exception as e:
                print(f"Error in get_user_chat: {str(e)}")
                self.data[user] = []
                return self.data[user]

    def use_model(self, name: str):
        """Changes the model being used for completions"""
        with self.data_lock:
            self.model = name

    def question_about(self, user: str, topic: Validator):
        """Generate a topic-specific question based on user's history"""
        system_prompt = f"""Using the conversation so far as context, gauge the user's
        understanding about the following topic:
        details: {topic.requirements()}
        examples of questions to ask the user: {topic.challenge()}

        Don't tell the user any of these details.
        Respond with a scenario similar to the examples, be creative.
        Do not reply until you have a valid question to ask
        Do NOT provide general advice, stick to the schema and QUIZ THE USER.
        Do your best to not repeat the same question.
        Make sure the user is challenged according to their performance.
        
        Your response must be in valid JSON format and include the following fields:
        question: str
        new_examples: list[str]
        """
        
        try:
            resp = self.get_structured_response(user, system_prompt, 
                [{"role": "system", "content": system_prompt}])
            question = resp.get("question", "")
            
            with self.data_lock:
                self.data[user] = self.get_user_chat(user) + [
                    {"role": "assistant", "content": question}
                ]
                self.save_user(user)
            
            logging.info(f"Generated question for user {user}: {question}")
            return question
        except Exception as e:
            logging.error(f"Error generating question for user {user}: {str(e)}")
            raise

    def evaluate(self, user: str, question: str, topic: Validator, answer_data: dict = {}):
        """Evaluate user's response to a question"""
        system_prompt = f"""Evaluate the user's response to the question you asked them:
        details: {topic.requirements()}
        question: {question}

        Address them directly and provide feedback on their response.
        Be specific about what was correct or incorrect.
        Provide guidance for improvement if needed.
        """

        try:
            with self.data_lock:
                completion = self.client.chat.completions.create(
                    model=self.model,
                    messages=self.get_user_chat(user) + [
                        {"role": "system", "content": system_prompt}
                    ],
                    reasoning_format="hidden",
                    temperature=0,
                )
                
                response = completion.choices[0].message.to_dict()
                self.data[user] = self.get_user_chat(user) + [response]
                self.save_user(user)

                if answer_data:
                    validation_result = topic.validate(answer_data)
                    logging.info(f"Answer validation for user {user}: {validation_result}")

                return response["content"]
        except Exception as e:
            logging.error(f"Error evaluating answer for user {user}: {str(e)}")
            raise

    def explain(self, user: str, topic: Validator):
        """Explain a topic to the user"""
        system_prompt = f"""Explain the following topic to the user:
        details: {topic.requirements()}
        
        Follow these guidelines:
        1. Start with basic concepts
        2. Use clear examples
        3. Break down complex ideas
        4. Relate to real-world applications where possible
        5. Ask the user if they have questions about the topic
        """

        try:
            with self.data_lock:
                history = self.get_user_chat(user) + [
                    {"role": "system", "content": system_prompt}
                ]
                
                completion = self.client.chat.completions.create(
                    model=self.model,
                    messages=history,
                    reasoning_format="hidden",
                    temperature=0,
                )
                
                response = completion.choices[0].message.to_dict()
                self.data[user] = history + [response]
                self.save_user(user)
                
                logging.info(f"Generated explanation for user {user} on topic {topic.__class__.__name__}")
                return response["content"]
        except Exception as e:
            logging.error(f"Error generating explanation for user {user}: {str(e)}")
            raise

    def capture_structured_input(self, user: str, input: str, item: Validator):
        """Process structured input from user and validate it"""
        system_prompt = f"""Extract information from the text and return as JSON matching this schema:
        schema: {item.requirements()}

        Additional formatting information:
        {item.format_msg or "No additional information provided, ensure valid JSON is returned."}
        """

        try:
            response = self.get_structured_response(
                user, 
                system_prompt, 
                [{"role": "user", "content": input}]
            )
            
            if "details" in response:
                del response["details"]

            with self.data_lock:
                self.data[user] = self.get_user_chat(user) + [
                    {"role": "user", "content": json.dumps(response)}
                ]
                self.save_user(user)

            return self.evaluate(user, input, item)
        except Exception as e:
            logging.error(f"Error processing structured input for user {user}: {str(e)}")
            raise
        
# At the bottom of ai.py
manager = AIManager()
# Expose the methods at module level
get_user_chat = manager.get_user_chat
chat_as = manager.chat_as
question_about = manager.question_about
evaluate = manager.evaluate
explain = manager.explain
capture_structured_input = manager.capture_structured_input
str_to_topic = manager.str_to_topic