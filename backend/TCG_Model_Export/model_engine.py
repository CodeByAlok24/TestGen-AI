import mlx_lm
import json
import os

# CONFIGURATION
MODEL_PATH = "mlx-community/Qwen2.5-Coder-1.5B-Instruct-4bit"
ADAPTERS_PATH = os.path.join(os.path.dirname(__file__), "adapters")

class TCGModel:
    def __init__(self):
        print(f"Loading TCG Model from {ADAPTERS_PATH}...")
        self.model, self.tokenizer = mlx_lm.load(
            MODEL_PATH, 
            adapter_path=ADAPTERS_PATH
        )

    def generate_test(self, code, language="python"):
        prompt = f"### [TESTCASE GENERATION]\nLanguage: {language}\nCode:\n{code}\n\n### Output (JSON format):"
        
        response = mlx_lm.generate(
            self.model, 
            self.tokenizer, 
            prompt=prompt,
            max_tokens=1000,
            verbose=False
        )
        
        # Self-healing JSON extractor
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response.strip()
            return json.loads(json_str)
        except Exception as e:
            return {"error": "Failed to parse AI output", "raw": response}

# EXAMPLE USAGE
if __name__ == "__main__":
    tcg = TCGModel()
    test_code = "def add(a, b): return a + b"
    result = tcg.generate_test(test_code, "python")
    print(json.dumps(result, indent=2))
