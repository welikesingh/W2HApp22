from django.contrib import admin
from .models import Patient, ScanReport, AnalysisResult


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'last_name', 'email', 'phone', 'age', 'sex', 'created_at']
    list_filter = ['sex', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']


@admin.register(ScanReport)
class ScanReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'test_type', 'scan_category', 'severity', 'created_at']
    list_filter = ['test_type', 'scan_category', 'severity', 'created_at']
    search_fields = ['patient__first_name', 'patient__last_name', 'impression']
    date_hierarchy = 'created_at'


@admin.register(AnalysisResult)
class AnalysisResultAdmin(admin.ModelAdmin):
    list_display = ['id', 'scan_report', 'report_title', 'severity', 'created_at']
    list_filter = ['severity', 'created_at']
    search_fields = ['report_title', 'impression']
    date_hierarchy = 'created_at'
