import os
import json
import json5
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found in environment variables.")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

def generate_schedule(user_input: str):
    today = datetime.today().strftime("%Y-%m-%d")

    result = client.chat.completions.create(
        model="moonshotai/kimi-k2-instruct-0905",
        messages=[
            {
                "role": "system",
                "content": """You are an AI study planner.

Create a 7-day study plan in valid JSON format only.

Return a valid JSON array where:
- "date" starts at today's date and increases by one calendar day for each entry
- "topic": topic to study
- "duration": number of hours as a string

Format:
[
  {
    "date": "YYYY-MM-DD",
    "topic": "Topic name",
    "duration": "3"
  },
  ...
]

No explanation, markdown, or headings. Return only valid JSON."""
            },
            {
                "role": "user",
                "content": f"""The user has requested the following:

"{user_input}"

Today's date is: {today}

Create a 7-day plan starting EXACTLY from {today} and increasing by one calendar day for each entry."""
            }
        ]
    )

    raw_output = result.choices[0].message.content.strip()

    try:
        return json.loads(raw_output)
    except json.JSONDecodeError:
        try:
            return json5.loads(raw_output)
        except Exception:
            print("⚠️ JSON parsing failed. Raw output:\n", raw_output)
            return None


if __name__ == "__main__":
    user_input = input("📚 Enter your request (e.g. 'I have an exam on OOPs in 7 days'): ")
    schedule = generate_schedule(user_input)

    if schedule:
        print("\n✅ Study Schedule:")
        print(json.dumps(schedule, indent=2))
    else:
        print("❌ Failed to generate schedule.")
