export function generateGithubWorkflow(framework = 'pytest') {
  if (framework === 'pytest') {
    return `name: AI Generated Tests
on: [push, pull_request]

jobs:
  testgen-suite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install pytest
      - name: Run AI-generated tests
        run: pytest test_generated.py -v --tb=short
`
  }

  if (framework === 'jest') {
    return `name: AI Generated Tests
on: [push, pull_request]

jobs:
  testgen-suite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run AI-generated tests
        run: npx jest --ci
`
  }

  return `name: AI Generated Tests
on: [push, pull_request]

jobs:
  testgen-suite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'
      - name: Run AI-generated tests
        run: mvn test
`
}
