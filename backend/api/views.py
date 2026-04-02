from __future__ import annotations

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .ci_exporter import generate_github_workflow
from .formatter import parse_output
from .healer import heal_test
from .llm_client import LLMClientError, call_llm
from .models import TestGenSession
from .prompt_builder import build_prompt
from .quality_scorer import score_tests
from .serializers import (
    CIExportRequestSerializer,
    GenerateRequestSerializer,
    HealRequestSerializer,
    SessionSerializer,
)


class GenerateTestsView(APIView):
    def post(self, request):
        ser = GenerateRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        raw_input = ser.validated_data["input"].strip()
        input_type = ser.validated_data["type"]
        test_mode = ser.validated_data["mode"]
        test_level = ser.validated_data["test_level"]
        provider = ser.validated_data["provider"]

        prompt = build_prompt(raw_input, input_type, test_mode, test_level)
        try:
            response = call_llm(prompt, provider=provider)
        except LLMClientError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        tests = parse_output(response)
        scores = score_tests(tests, provider=provider)

        session = TestGenSession.objects.create(
            input_type=input_type,
            test_mode=test_mode,
            raw_input=raw_input,
            quality_score=scores.get("overall"),
            scores=scores,
            generated_pytest=tests.get("pytest", ""),
            generated_junit=tests.get("junit", ""),
            generated_jest=tests.get("jest", ""),
        )
        return Response({"id": session.id, "tests": tests, "scores": scores})


class HealTestView(APIView):
    def post(self, request):
        ser = HealRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        fixed = heal_test(
            ser.validated_data["failing_test"],
            ser.validated_data["error_msg"],
            provider=ser.validated_data["provider"],
        )
        return Response({"fixed_test": fixed})


class CIExportView(APIView):
    def post(self, request):
        ser = CIExportRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        workflow = generate_github_workflow(
            tests=ser.validated_data["tests"], framework=ser.validated_data["framework"]
        )
        return Response({"workflow_yaml": workflow})


class SessionsView(APIView):
    def get(self, request):
        qs = TestGenSession.objects.order_by("-created_at")[:20]
        return Response(SessionSerializer(qs, many=True).data)
