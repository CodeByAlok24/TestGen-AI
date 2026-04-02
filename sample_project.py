# Sample Project for TestGen AI
# Use this code to test both Black Box and White Box generation.

class Calculator:
    """A sample calculator with basic math operations.
       
       Black Box view: sum(a, b) should return a + b.
       White Box view: Check for numeric validation and exception handling.
    """

    def sum(self, a, b):
        """Returns the sum of two numbers."""
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
             raise TypeError("Inputs must be numeric")
        return a + b

    def divide(self, a, b):
        """Returns the division of a by b."""
        if b == 0:
            raise ZeroDivisionError("Cannot divide by zero")
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
             raise TypeError("Inputs must be numeric")
        return a / b

# --- API ENDPOINT DESCRIPTION (For Black Box Testing) ---
# POST /api/sum
# Payload: { "a": number, "b": number }
# Expected: { "result": number }
# Error: { "error": "Inputs must be numeric" }

# POST /api/divide
# Payload: { "a": number, "b": number }
# Expected: { "result": number }
# Error: { "error": "Cannot divide by zero" }
