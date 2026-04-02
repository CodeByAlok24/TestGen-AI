from __future__ import annotations

from rest_framework import serializers

from .models import TestGenSession


class GenerateRequestSerializer(serializers.Serializer):
    input = serializers.CharField(allow_blank=False, trim_whitespace=True)
    type = serializers.ChoiceField(choices=[c[0] for c in TestGenSession.INPUT_TYPES], default="code")
    mode = serializers.ChoiceField(choices=[c[0] for c in TestGenSession.TEST_MODES], default="black_box")
    test_level = serializers.ChoiceField(
        choices=["unit", "integration", "acceptance", "system"],
        default="unit",
    )
    provider = serializers.ChoiceField(choices=["api", "local"], default="api")


class HealRequestSerializer(serializers.Serializer):
    failing_test = serializers.CharField(allow_blank=False, trim_whitespace=False)
    error_msg = serializers.CharField(allow_blank=False, trim_whitespace=False)
    provider = serializers.ChoiceField(choices=["api", "local"], default="api")


class CIExportRequestSerializer(serializers.Serializer):
    framework = serializers.ChoiceField(choices=["pytest", "junit", "jest"], default="pytest")
    tests = serializers.DictField(child=serializers.CharField(), required=True)


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestGenSession
        fields = [
            "id",
            "input_type",
            "test_mode",
            "raw_input",
            "generated_pytest",
            "generated_junit",
            "generated_jest",
            "quality_score",
            "scores",
            "coverage_report",
            "created_at",
        ]
