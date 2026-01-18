import os
import json
from openai import OpenAI

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found in environment variables.")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)


def generate_topic_content(topic: str, details: str | None = None, subtopics: list[str] | None = None):
    schema = {
        "topic": "",
        "overview": "",
        "learning_objectives": [],
        "prerequisites": [],
        "eli5": "",
        "core_concepts": [
            {
                "title": "",
                "explanation": "",
                "key_points": []
            }
        ],
        "worked_examples": [
            {
                "problem": "",
                "explanation": "",
                "final_answer": ""
            }
        ],
        "visuals": [
            {
                "type": "diagram | chart | flow",
                "description": ""
            }
        ],
        "real_world_applications": [],
        "common_mistakes": [],
        "exam_interview_relevance": [],
        "quick_revision": [],
        "next_actions": {
            "suggested_practice": "",
            "suggested_quiz": "",
            "suggested_flashcards": ""
        }
    }

    user_topic = (topic or "").strip()
    details_value = (details or "").strip()
    subtopics_list = subtopics or []

    system_content = """
You are an expert teacher creating structured teaching content for one learning topic.

Requirements:
- Beginner-friendly and highly detailed, suitable for self-study.
- Step-by-step and logically ordered, like a mini-course.
- Strongly exam-oriented with clear focus on what is tested.
- Original (do not copy) and avoid generic filler sentences.
- Output must be strict JSON, UI-renderable.

Content density rules:
- learning_objectives: 5–8 clear, exam-focused objectives.
- prerequisites: 3–6 concise items.
- core_concepts: 4–7 concepts, each with a multi-paragraph explanation and 4–8 key_points.
- worked_examples: 3–5 examples with detailed step-by-step explanation.
- visuals: 3–5 items describing useful mental diagrams or flows.
- real_world_applications: 3–6 items linking to real systems or scenarios.
- common_mistakes: 5–10 items, each describing what and why.
- exam_interview_relevance: 5–10 bullet points about typical questions or patterns.
- quick_revision: 8–15 short bullets for last-minute revision.
- next_actions fields should be concrete and actionable, not generic.

You must follow exactly this JSON schema and key names:
{schema}

Do not add extra keys.
Do not include markdown.
Do not include explanations outside JSON.
""".replace("{schema}", json.dumps(schema, indent=2))

    user_content = f"""
Topic: {user_topic}

Details: {details_value}

Subtopics:
{os.linesep.join(f"- {s}" for s in subtopics_list)}
"""

    result = client.chat.completions.create(
        model="moonshotai/kimi-k2-instruct-0905",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_content},
            {"role": "user", "content": user_content}
        ],
    )

    raw = result.choices[0].message.content
    data = json.loads(raw)
    return data
