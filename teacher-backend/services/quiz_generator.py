import requests
import json
import re

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5:3b"

REQUIRED_KEYS = {"question", "options", "correct_answer"}
MAX_RETRIES = 3


# ─────────────────────────────────────────────────────────────────────────────
# 1.  PDF TEXT CLEANING  (chemistry-focused — no math formula handling)
# ─────────────────────────────────────────────────────────────────────────────

def clean_pdf_text(text):
    """
    Light cleaning for chemistry PDFs.
    Converts Greek / chem unicode to ASCII. Does NOT touch math formulas.
    """

    # Greek letters and common chem/physics unicode → ASCII
    unicode_map = {
        '\u0391': 'Alpha',   '\u0392': 'Beta',    '\u0393': 'Gamma',
        '\u0394': 'Delta',   '\u03b1': 'alpha',   '\u03b2': 'beta',
        '\u03b3': 'gamma',   '\u03b4': 'delta',   '\u03b5': 'epsilon',
        '\u03b7': 'eta',     '\u03b8': 'theta',   '\u03bb': 'lambda',
        '\u03bc': 'mu',      '\u03bd': 'nu',      '\u03c0': 'pi',
        '\u03c1': 'rho',     '\u03c3': 'sigma',   '\u03c4': 'tau',
        '\u03c6': 'phi',     '\u03c9': 'omega',
        '\u00d7': 'x',       '\u00f7': '/',        '\u00b1': '+/-',
        '\u2212': '-',       '\u2265': '>=',       '\u2264': '<=',
        '\u2260': '!=',      '\u221e': 'infinity', '\u221a': 'sqrt',
        '\u00b2': '^2',      '\u00b3': '^3',
        '\u2080': '_0',      '\u2081': '_1',       '\u2082': '_2',
        '\u2083': '_3',      '\u2084': '_4',
        '\u00b0': ' degrees','\u00b5': 'mu',
        '\u2019': "'",       '\u2018': "'",
        '\u201c': '"',       '\u201d': '"',
        '\u2013': '-',       '\u2014': '-',
        '\u2026': '...',
    }
    for char, replacement in unicode_map.items():
        text = text.replace(char, replacement)

    # Strip non-ASCII
    text = text.encode('ascii', 'ignore').decode('ascii')

    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    return text


# ─────────────────────────────────────────────────────────────────────────────
# 2.  JSON REPAIR
# ─────────────────────────────────────────────────────────────────────────────

def fix_invalid_escapes(text):
    def replace_escape(m):
        char = m.group(1)
        if char in ('"', '\\', '/', 'b', 'f', 'n', 'r', 't'):
            return m.group(0)
        if char == 'u':
            following = m.string[m.start() + 2: m.start() + 6]
            if re.match(r'^[0-9a-fA-F]{4}$', following):
                return m.group(0)
        return char
    return re.sub(r'\\(.)', replace_escape, text)


def extract_json(text):
    cleaned = re.sub(r'[^\x20-\x7E]', '', text)
    cleaned = re.sub(r'```json|```', '', cleaned).strip()
    cleaned = fix_invalid_escapes(cleaned)
    match = re.search(r'\[.*\]', cleaned, re.DOTALL)
    return match.group(0) if match else cleaned


# ─────────────────────────────────────────────────────────────────────────────
# 3.  ANSWER NORMALISATION
# ─────────────────────────────────────────────────────────────────────────────

def normalize_correct_answer(q):
    options = q.get('options', [])
    correct = q.get('correct_answer', '').strip()

    if not options or not correct:
        return correct

    if correct.upper() in ['A', 'B', 'C', 'D']:
        index = ord(correct.upper()) - ord('A')
        if 0 <= index < len(options):
            return options[index]

    letter_prefix = re.match(r'^([A-Da-d])[.)]\s*(.+)$', correct)
    if letter_prefix:
        index = ord(letter_prefix.group(1).upper()) - ord('A')
        if 0 <= index < len(options):
            return options[index]

    for opt in options:
        if opt.strip() == correct:
            return opt.strip()

    for opt in options:
        if opt.strip().lower() == correct.lower():
            return opt.strip()

    for opt in options:
        if correct.lower() in opt.lower() or opt.lower() in correct.lower():
            return opt.strip()

    print(f"[normalize] Could not resolve '{correct}' — falling back to first option")
    return options[0].strip() if options else correct


# ─────────────────────────────────────────────────────────────────────────────
# 4.  VALIDATION
# ─────────────────────────────────────────────────────────────────────────────

def has_duplicate_options(options):
    normalized = []
    for opt in options:
        n = re.sub(r'\s+', ' ', str(opt)).strip().lower()
        if len(n) > 3:
            normalized.append(n)
    return len(normalized) != len(set(normalized))


def is_valid_question(q):
    if not isinstance(q, dict):
        return False
    if not REQUIRED_KEYS.issubset(q.keys()):
        return False
    if not isinstance(q.get('options'), list) or len(q['options']) < 4:
        return False
    if not isinstance(q.get('question'), str) or not q['question'].strip():
        return False
    if not isinstance(q.get('correct_answer'), str) or not q['correct_answer'].strip():
        return False
    if has_duplicate_options(q['options']):
        print(f"[Quiz Generator] Skipping — duplicate options: {q['options']}")
        return False
    return True


def normalize_question(q):
    options = [str(o).strip() for o in q['options']]
    while len(options) < 4:
        options.append('N/A')
    options = options[:4]

    resolved_answer = normalize_correct_answer({
        'options': options,
        'correct_answer': q['correct_answer'],
    })

    return {
        'question': q['question'].strip(),
        'options': options,
        'correct_answer': resolved_answer,
        'difficulty': q.get('difficulty', 'medium').strip(),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5.  MODEL CALL
# ─────────────────────────────────────────────────────────────────────────────

def call_model(prompt):
    response = requests.post(
        OLLAMA_URL,
        json={
            'model': MODEL,
            'prompt': prompt,
            'stream': False,
            'options': {
                'temperature': 0.3,
                'num_predict': 2048,
                'stop': [']\n\n', '\n\n\n'],
                'keep_alive': '10m',
            },
        },
        timeout=240,
    )
    result = response.json()
    raw = result.get('response', '')
    print('\n--- RAW MODEL OUTPUT ---\n', raw, '\n---\n')
    return raw


# ─────────────────────────────────────────────────────────────────────────────
# 6.  PROMPT  (conceptual only — no formula options)
# ─────────────────────────────────────────────────────────────────────────────

def build_prompt(text, still_needed):
    return (
        'You are an expert chemistry MCQ quiz generator.\n\n'

        'STRICT OUTPUT RULES:\n'
        f'- Generate EXACTLY {still_needed} multiple choice questions\n'
        '- Return ONLY a valid JSON array — no explanations, no markdown fences\n'
        '- Each object must have: "question", "options" (array of exactly 4 strings),\n'
        '  "correct_answer" (copied EXACTLY from one of the options),\n'
        '  "difficulty" (easy / medium / hard)\n'
        '- All 4 options MUST be clearly different from each other\n\n'

        'QUESTION STYLE — VERY IMPORTANT:\n'
        '- Ask CONCEPTUAL questions: what does X represent, what are the units of Y,\n'
        '  what happens when Z increases, which statement is correct about W, etc.\n'
        '- Write options as SHORT PLAIN ENGLISH PHRASES — never raw formula strings\n'
        '- Do NOT ask "write the formula for X" — ask about meaning, units, conditions\n\n'

        'EXAMPLE (follow this style exactly):\n'
        '[\n'
        '  {\n'
        '    "question": "What does the principal quantum number n represent?",\n'
        '    "options": [\n'
        '      "The energy level of the electron",\n'
        '      "The shape of the orbital",\n'
        '      "The spin of the electron",\n'
        '      "The magnetic orientation of the orbital"\n'
        '    ],\n'
        '    "correct_answer": "The energy level of the electron",\n'
        '    "difficulty": "easy"\n'
        '  }\n'
        ']\n\n'

        'Generate questions from this content:\n'
        + text[:3000]
        + '\n\nReturn ONLY the JSON array:'
    )


# ─────────────────────────────────────────────────────────────────────────────
# 7.  MAIN ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

def generate_questions(text, target_count=5):
    text = clean_pdf_text(text)

    collected = []
    seen_questions = set()

    for attempt in range(1, MAX_RETRIES + 1):
        still_needed = target_count - len(collected)
        if still_needed <= 0:
            break

        print(f'[Quiz Generator] Attempt {attempt}/{MAX_RETRIES} — need {still_needed} more question(s)')

        prompt = build_prompt(text, still_needed)

        try:
            raw = call_model(prompt)
            cleaned = extract_json(raw)
            parsed = json.loads(cleaned)

            if not isinstance(parsed, list):
                print(f'[Quiz Generator] Attempt {attempt}: parsed value is not a list')
                continue

            for q in parsed:
                if not is_valid_question(q):
                    print(f'[Quiz Generator] Skipping invalid question: {q}')
                    continue

                normalized = normalize_question(q)
                q_key = normalized['question'].lower().strip()

                if q_key in seen_questions:
                    print(f"[Quiz Generator] Skipping duplicate: {normalized['question'][:60]}")
                    continue

                seen_questions.add(q_key)
                collected.append(normalized)

                if len(collected) >= target_count:
                    break

        except json.JSONDecodeError as e:
            print(f'[Quiz Generator] Attempt {attempt}: JSON parse error — {e}')
        except requests.RequestException as e:
            print(f'[Quiz Generator] Attempt {attempt}: Request error — {e}')
        except Exception as e:
            print(f'[Quiz Generator] Attempt {attempt}: Unexpected error — {e}')

    print(f'[Quiz Generator] Final result: {len(collected)}/{target_count} questions collected')
    return collected[:target_count]