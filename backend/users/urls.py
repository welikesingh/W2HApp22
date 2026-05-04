from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # Patient endpoints
    path('patients/', views.PatientListCreateView.as_view(), name='patient_list_create'),
    path('patients/<int:pk>/', views.PatientDetailView.as_view(), name='patient_detail'),
    
    # Scan endpoints
    path('scans/', views.ScanReportListCreateView.as_view(), name='scan_list_create'),
    path('scans/<int:pk>/', views.ScanReportDetailView.as_view(), name='scan_detail'),
    
    # Analysis endpoints
    path('analyze/', views.analyze_scan, name='analyze_scan'),
    path('advice/', views.get_advice, name='get_advice'),
    path('hepato-analyze/', views.hepato_analyze, name='hepato_analyze'),
    path('hepato-advice/', views.hepato_advice, name='hepato_advice'),
]
