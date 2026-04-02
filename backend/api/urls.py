from django.urls import path

from .auth_views import LoginView, SignupView
from .views import CIExportView, GenerateTestsView, HealTestView, SessionsView

urlpatterns = [
    path("generate/", GenerateTestsView.as_view(), name="generate"),
    path("heal/", HealTestView.as_view(), name="heal"),
    path("ci-export/", CIExportView.as_view(), name="ci_export"),
    path("sessions/", SessionsView.as_view(), name="sessions"),
    path("auth/signup/", SignupView.as_view(), name="signup"),
    path("auth/login/", LoginView.as_view(), name="login"),
]

