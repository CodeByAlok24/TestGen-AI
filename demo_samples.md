# TestGen AI Sample Inputs and API Guide

Use these samples to test the **TestGen AI** generator. You can copy-paste these snippets into the **Input Panel** in the UI.

---

1. Unit Test Generation
Input type: Code
Test mode: White Box
Testing level: Unit
Language: Python

def calculate_discount(price, user_type, coupon_code=None):
    if price <= 0:
        raise ValueError("price must be greater than 0")

    discount = 0

    if user_type == "premium":
        discount += 20
    elif user_type == "regular":
        discount += 10

    if coupon_code == "SAVE10":
        discount += 10
    elif coupon_code == "SAVE20":
        discount += 20

    final_price = price - (price * discount / 100)

    if final_price < 0:
        return 0

    return round(final_price, 2)

2. Integration Test Generation
Input type: Code
Test mode: White Box
Testing level: Integration
Language: Python

def create_order(user_service, inventory_service, order_repo, user_id, item_id):
    user = user_service.get_user(user_id)
    item = inventory_service.get_item(item_id)

    if not user:
        raise ValueError("user not found")

    if not item:
        raise ValueError("item not found")

    if item["stock"] <= 0:
        raise ValueError("out of stock")

    order = {
        "user_id": user["id"],
        "item_id": item["id"],
        "price": item["price"],
    }

    return order_repo.save(order)

3. Acceptance Test Generation
Input type: User Story
Test mode: Black Box
Testing level: Acceptance

As a premium customer, I want to apply a valid coupon during checkout so that I receive the correct final discounted price before payment.

4. System Test Generation
Input type: User Story
Test mode: Black Box
Testing level: System

A user logs in, adds a product to the cart, applies the coupon SAVE10, completes payment, and receives an order confirmation with the final discounted total.

5. API Endpoint Test Generation
Input type: API Endpoint
Test mode: Black Box
Testing level: Integration

POST /api/orders
Request body:
{
  "user_id": 101,
  "item_id": 501,
  "coupon_code": "SAVE10"
}

Expected behavior:
- returns 201 on successful order creation
- returns 404 if user not found
- returns 404 if item not found
- returns 400 if item is out of stock
- returns JSON with order_id and final_price

6. JavaScript Sample
Input type: Code
Test mode: White Box
Testing level: Unit
Language: JavaScript

function getShippingCost(weight, isPremium) {
  if (weight <= 0) {
    throw new Error("Invalid weight");
  }

  if (isPremium) {
    return 0;
  }

  if (weight <= 5) {
    return 50;
  }

  if (weight <= 20) {
    return 100;
  }

  return 200;
}

7. Java Sample
Input type: Code
Test mode: White Box
Testing level: Unit
Language: Java

public class Calculator {
    public int divide(int a, int b) {
        if (b == 0) {
            throw new IllegalArgumentException("Division by zero");
        }
        return a / b;
    }
}

8. C++ Sample
Input type: Code
Test mode: White Box
Testing level: Unit
Language: C++

#include <stdexcept>
using namespace std;

int findMax(int a, int b, int c) {
    if (a >= b && a >= c) return a;
    if (b >= a && b >= c) return b;
    return c;
}

9. File Upload Test
Create a file like sample_project.py with this content, then upload it:

def process_scores(scores):
    if scores is None:
        raise ValueError("scores cannot be None")

    if not isinstance(scores, list):
        raise TypeError("scores must be a list")

    if len(scores) == 0:
        return {"average": 0, "passed": 0, "failed": 0}

    total = 0
    passed = 0
    failed = 0

    for score in scores:
        if not isinstance(score, (int, float)):
            raise TypeError("all scores must be numbers")

        if score < 0 or score > 100:
            raise ValueError("score must be between 0 and 100")

        total += score

        if score >= 40:
            passed += 1
        else:
            failed += 1

    average = total / len(scores)

    return {
        "average": round(average, 2),
        "passed": passed,
        "failed": failed,
    }

10. Self-Heal Test Sample 1
Failing test:

def get_user_role(user):
    if not user:
        return "guest"
    return user.get("role", "guest")

def test_get_user_role():
    assert get_user_role(None) == "admin"

Error message:
AssertionError: assert 'guest' == 'admin'

11. Self-Heal Test Sample 2
Failing test:

import pytest

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def test_divide_by_zero():
    assert divide(10, 0) == 0

Error message:
ValueError: Cannot divide by zero

12. Quality Score Test
Use this intentionally weak test so the score feature has something obvious to critique:

def add(a, b):
    return a + b

Generated weak-style test expectation:

def test_add():
    assert add(1, 2) == 3
This should expose missing edge cases and limited coverage.

13. CI Export Test
Generate tests first with any of the above samples, then use:

Framework: Pytest
Framework: JUnit
Framework: Jest
This checks that CI workflow export works for all three outputs.

14. Provider Toggle Test
Use the same sample in both modes:

API
Custom Trained Model
Recommended sample:

def is_even(n):
    if not isinstance(n, int):
        raise TypeError("n must be int")
    return n % 2 == 0

This helps compare:

output speed
output quality
format consistency

15. Login / Signup Test
Use:

Signup with a new email/username
Login with the same credentials
Logout
Login again
This verifies auth flow and session behavior.