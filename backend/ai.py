import os
from groq import Groq

# Initialize the Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Example usage: Create a chat completion
chat_completion = client.chat.completions.create(
    messages=[
        {"role": "user", "content": "Explain the importance of low latency LLMs"}
    ],
    model="llama3-8b-8192",
)

# Print the response
print(chat_completion.choices[0].message.content)
