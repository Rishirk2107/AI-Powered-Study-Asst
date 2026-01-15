import os
import json
import json5
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from dateutil import parser
from difflib import get_close_matches

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found in environment variables.")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

# -------------------------
# Date utilities
# -------------------------

MONTHS = [
    "january","february","march","april","may","june",
    "july","august","september","october","november","december"
]

def normalize_months(text: str) -> str:
    words = text.lower().split()
    corrected = []
    for word in words:
        match = get_close_matches(word, MONTHS, n=1, cutoff=0.7)
        corrected.append(match[0] if match else word)
    return " ".join(corrected)

def extract_end_date(user_input: str):
    today = datetime.today().date()
    normalized = normalize_months(user_input)

    try:
        parsed_date = parser.parse(
            normalized,
            fuzzy=True,
            dayfirst=True
        ).date()

        # If year missing or parsed date is in past → assume next year
        if parsed_date < today:
            parsed_date = parsed_date.replace(year=today.year + 1)

        return parsed_date

    except Exception:
        return None

# -------------------------
# LLM fallback for date extraction
# -------------------------

def llm_extract_date(user_input: str):
    today = datetime.today().strftime("%Y-%m-%d")

    prompt = f"""
Extract the END DATE mentioned in the text.
Fix spelling mistakes if needed.

Rules:
- Return ONLY one date in YYYY-MM-DD format
- If no date exists, return null
- Today is {today}

Text:
{user_input}
"""

    result = client.chat.completions.create(
        model="moonshotai/kimi-k2-instruct-0905",
        messages=[{"role": "user", "content": prompt}]
    )

    raw = result.choices[0].message.content.strip()

    try:
        return datetime.strptime(raw, "%Y-%m-%d").date()
    except Exception:
        return None

def calculate_total_days(user_input: str):
    today = datetime.today().date()

    end_date = extract_end_date(user_input)
    if not end_date:
        end_date = llm_extract_date(user_input)

    if not end_date:
        raise ValueError(
            "❌ Couldn't understand the end date. Try like 'Feb 8' or '8 Feb'."
        )

    return (end_date - today).days + 1


import re

def extract_json_array(text: str):
    """
    Extracts the first JSON array from text safely.
    """
    if not text:
        return None

    # Remove code fences ```json ``` or ```
    text = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).strip()

    # Find first JSON array
    match = re.search(r"\[\s*{.*}\s*\]", text, re.DOTALL)
    if match:
        return match.group(0)

    return None


# -------------------------
# Schedule generation
# -------------------------

def generate_schedule(user_input: str):
    today_str = datetime.today().strftime("%Y-%m-%d")
    total_days = calculate_total_days(user_input)

    result = client.chat.completions.create(
        model="moonshotai/kimi-k2-instruct-0905",
        response_format={"type": "json_object"},  # ✅ JSON MODE
        messages=[
            {
                "role": "system",
                "content": f"""
You are an AI study planner.

Create a study plan for EXACTLY {total_days} days.

Rules:
- Start date: {today_str}
- Each next entry increments by 1 calendar day
- The schedule array MUST contain exactly {total_days} items

Return ONLY valid JSON in this exact shape:

{{
  "schedule": [
    {{
      "date": "YYYY-MM-DD",
      "topic": "Topic name",
      "duration": "number of hours"
    }}
  ]
}}
"""
            },
            {
                "role": "user",
                "content": user_input
            }
        ]
    )

    raw_output = result.choices[0].message.content

    # ✅ Guaranteed JSON object
    data = json.loads(raw_output)

    schedule = data.get("schedule")
    if not isinstance(schedule, list):
        raise ValueError("❌ 'schedule' missing or not a list")

    if len(schedule) != total_days:
        raise ValueError(
            f"❌ Expected {total_days} days, got {len(schedule)}"
        )
    print("Generated schedule:", schedule)
    return schedule

# -------------------------
# Main
# -------------------------

if __name__ == "__main__":
    user_input = input("📚 Enter your request: ")

    try:
        schedule = generate_schedule(user_input)
        print("\n✅ Study Schedule:")
        print(json.dumps(schedule, indent=2))
    except Exception as e:
        print(str(e))
