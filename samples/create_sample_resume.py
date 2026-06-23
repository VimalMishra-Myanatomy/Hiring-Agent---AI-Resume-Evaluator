"""Generate a minimal sample resume PDF for end-to-end testing."""

import fitz
from pathlib import Path

SAMPLE_TEXT = """Jane Developer
Software Engineer
jane.developer@email.com | San Francisco, CA
GitHub: https://github.com/octocat

EXPERIENCE
Software Engineer | Tech Startup Inc | 2022 - Present
- Built REST APIs with Python and FastAPI serving 50k daily users
- Led migration from monolith to microservices on AWS
- Mentored 2 junior engineers

Intern | Big Corp | Summer 2021
- Developed internal dashboard using React and TypeScript

EDUCATION
B.S. Computer Science | State University | 2018 - 2022
GPA: 3.7

SKILLS
Python, JavaScript, TypeScript, React, FastAPI, PostgreSQL, Docker, AWS, Git

PROJECTS
TaskFlow - Open-source task manager with 200+ GitHub stars
https://github.com/octocat/TaskFlow
- Real-time collaboration, WebSocket sync, PostgreSQL backend

WeatherCLI - Personal CLI tool for weather forecasts
https://github.com/octocat/weather-cli
"""

def main():
    out = Path(__file__).parent / "sample_resume.pdf"
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)
    rect = fitz.Rect(72, 72, 540, 720)
    page.insert_textbox(rect, SAMPLE_TEXT, fontsize=11, fontname="helv")
    doc.save(out)
    doc.close()
    print(f"Created {out}")

if __name__ == "__main__":
    main()
