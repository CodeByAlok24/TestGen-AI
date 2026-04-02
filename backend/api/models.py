from django.db import models

class TestGenSession(models.Model):
    TEST_MODES = [("black_box", "Black Box"), ("white_box", "White Box")]
    INPUT_TYPES = [("code", "Code"), ("api", "API Endpoint"), ("story", "User Story")]

    input_type = models.CharField(max_length=20, choices=INPUT_TYPES)
    test_mode = models.CharField(max_length=20, choices=TEST_MODES, default="black_box")
    raw_input = models.TextField()

    generated_pytest = models.TextField(blank=True)
    generated_junit = models.TextField(blank=True)
    generated_jest = models.TextField(blank=True)

    quality_score = models.FloatField(null=True)
    scores = models.JSONField(null=True)
    coverage_report = models.JSONField(null=True)

    created_at = models.DateTimeField(auto_now_add=True)
