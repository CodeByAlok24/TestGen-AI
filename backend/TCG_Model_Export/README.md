# TCG AI Model: Standalone Integration Guide

This directory contains the **fine-tuned weights (LoRA adapters)** and the **inference engine** for the Dual-Mode AI Testcase Generator. You can now use this AI directly in any other Python project.

## Directory Structure
- `adapters/`: Contains the specialized intelligence trained for test case generation.
- `model_engine.py`: A clean Python wrapper to run the model with a single function call.

## Prerequisites
To run this model, you need a Mac with Apple Silicon (M1/M2/M3) and the following libraries:
```bash
pip install mlx-lm
```

## How to Link to Your Project

### Option 1: Direct Import (Python)
1. Copy the `TCG_Model_Export` folder into your new project.
2. Import and use it in your code:

```python
from model_engine import TCGModel

# Initialize 
tcg = TCGModel()

# Generate 
my_code = "def multiply(a, b): return a * b"
result = tcg.generate_test(my_code, language="python")

print(result)
```

### Option 2: Run as a Microservice
You can run the existing `model_engine.py` as a standalone service by adding a simple Flask or FastAPI wrapper around it.

## Pro Tips for Other Projects:
- **Max Tokens**: Increase `max_tokens` in `model_engine.py` if you are analyzing very long files.
- **Language Toggle**: The model is trained on Python, JS, Go, Java, and C++. Pass the correct `language` parameter for better results.
- **Prompting**: Always use the `### [TESTCASE GENERATION]` marker as shown in the engine; it's what the model was trained to recognize!

---
**Model exported by Antigravity AI**
 *Project: Dual-Mode AI Testcase Generator*
