import os
import json
import json5
from datetime import datetime
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def generate_schedule(user_input: str):
    if not GROQ_API_KEY:
        raise ValueError("❌ GROQ_API_KEY not found in environment variables.")

    today = datetime.today().strftime("%Y-%m-%d")
    llm = ChatGroq(api_key=GROQ_API_KEY, model="llama3-70b-8192")

    prompt = ChatPromptTemplate.from_template("""
You are an AI study planner.

The user has requested the following:

"{user_input}"

Today's date is: {today}  
Create a 7-day plan starting EXACTLY from {today} and increasing by one calendar day for each entry.

Return a valid JSON array where:
- "date" starts at {today}
- "topic": topic to study
- "duration": number of hours as a string

Format:
[
  {{
    "date": "YYYY-MM-DD",
    "topic": "Topic name",
    "duration": "3"
  }},
  ...
]

No explanation, markdown, or headings. Return only valid JSON.
""")

    chain = prompt | llm
    result = chain.invoke({
        "user_input": user_input,
        "today": today
    })

    raw_output = result.content.strip()

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
