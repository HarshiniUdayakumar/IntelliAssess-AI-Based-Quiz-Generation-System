from services.quiz_generator import generate_questions

text = """
Memory management is a process used by operating systems to control and coordinate computer memory.
It allows efficient usage of RAM and prevents memory leaks.
"""

result = generate_questions(text)

print("\nFINAL OUTPUT:\n")
print(result)