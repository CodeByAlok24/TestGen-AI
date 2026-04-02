from __future__ import annotations


def generate_github_workflow(tests: dict, framework: str = "pytest") -> str:
    if framework == "pytest":
        run_cmd = "pytest test_generated.py -v --tb=short"
        setup = """- name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install pytest
"""
    elif framework == "jest":
        run_cmd = "npx jest --ci"
        setup = """- name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
"""
    else:
        run_cmd = "mvn test"
        setup = """- name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'
"""

    return f"""name: AI Generated Tests
on: [push, pull_request]

jobs:
  testgen-suite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      {setup.strip()}
      - name: Run AI-generated tests
        run: {run_cmd}
"""

