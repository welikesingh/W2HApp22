from django.db import models


class Patient(models.Model):
    SEX_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    medical_history = models.TextField(blank=True, null=True)
    alcohol_use = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patients'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class ScanReport(models.Model):
    SCAN_CATEGORIES = [
        ('liver', 'Liver'),
        ('general', 'General'),
    ]
    
    TEST_TYPES = [
        ('ultrasound', 'Ultrasound'),
        ('ct', 'CT Scan'),
        ('mri', 'MRI'),
        ('xray', 'X-Ray'),
        ('other', 'Other'),
    ]
    
    SEVERITY_CHOICES = [
        ('normal', 'Normal'),
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='scan_reports')
    test_type = models.CharField(max_length=20, choices=TEST_TYPES, default='ultrasound')
    scan_category = models.CharField(max_length=20, choices=SCAN_CATEGORIES, default='general')
    symptoms = models.TextField(blank=True, null=True)
    scan_image = models.TextField(blank=True, null=True)  # Base64 encoded image
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, blank=True, null=True)
    scan_quality = models.CharField(max_length=100, blank=True, null=True)
    impression = models.TextField(blank=True, null=True)
    recommended_follow_up = models.TextField(blank=True, null=True)
    limitations = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'scan_reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"Scan {self.id} - {self.patient} ({self.test_type})"


class AnalysisResult(models.Model):
    SEVERITY_CHOICES = [
        ('normal', 'Normal'),
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ]
    
    scan_report = models.ForeignKey(ScanReport, on_delete=models.CASCADE, related_name='analysis_results')
    report_title = models.CharField(max_length=200, blank=True, null=True)
    urgency = models.CharField(max_length=20, blank=True, null=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, blank=True, null=True)
    scan_quality = models.CharField(max_length=100, blank=True, null=True)
    findings = models.JSONField(default=list)
    impression = models.TextField(blank=True, null=True)
    differential_diagnosis = models.JSONField(default=list)
    possible_conditions = models.JSONField(default=list)
    recommended_follow_up = models.TextField(blank=True, null=True)
    limitations = models.TextField(blank=True, null=True)
    # Advice fields
    simple_summary = models.TextField(blank=True, null=True)
    what_it_means = models.TextField(blank=True, null=True)
    recommendations = models.JSONField(default=list)
    red_flags = models.JSONField(default=list)
    warning_signs = models.JSONField(default=list)
    specialist_referral = models.CharField(max_length=200, blank=True, null=True)
    disclaimer = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analysis_results'
        ordering = ['-created_at']

    def __str__(self):
        return f"Analysis {self.id} - {self.report_title}"
