import requests
import json
import re

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5:1.5b"


def extract_json(text):
    """
    Extract JSON array safely from model output
    """
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)

    match = re.search(r"\[.*\]", text, re.DOTALL)
    return match.group(0) if match else text.strip()


def generate_questions(text):

    prompt = f"""
You are an expert MCQ generator.

Generate EXACTLY 5 multiple-choice questions.

CRITICAL RULES:
- Return ONLY ONE valid JSON array
- DO NOT create multiple arrays
- DO NOT repeat JSON blocks
- DO NOT add explanation or text
- Output must start with [ and end with ]

Format strictly:

[
  {{
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A",
    "difficulty": "easy"
  }}
]

CONTENT:
{text[:2500]}
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False
        }
    )

    result = response.json()
    raw_output = result["response"]

    print("\nRAW OUTPUT:\n", raw_output)

    cleaned = extract_json(raw_output)

    try:
        data = json.loads(cleaned)

        # Ensure correct format
        if isinstance(data, list):
            return data

    except Exception as e:
        return {
            "error": str(e),
            "raw_output": raw_output
        }