from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.CitizenDashboardView.as_view(), name='citizen_dashboard'),
    path('agent/dashboard/', views.AgentDashboardView.as_view(), name='agent_dashboard'),
    path('dossier/nouveau/', views.DossierCreateView.as_view(), name='dossier_create'),
    path('dossier/<int:pk>/', views.DossierDetailView.as_view(), name='dossier_detail'),
    path('dossier/<int:pk>/statut/', views.DossierUpdateStatusView.as_view(), name='dossier_update_status'),
    path('dossier/<int:pk>/pdf/', views.generate_pdf_extrait, name='generate_pdf'),
]
