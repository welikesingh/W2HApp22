import os
import base64
import requests
import jwt
import bcrypt
from datetime import datetime, timedelta
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from .models import Patient, ScanReport, AnalysisResult
from .serializers import PatientSerializer, ScanReportSerializer, AnalysisResultSerializer

# Simple in-memory user storage (replace with database model in production)
_users = {}

def generate_token(user_id, email, name):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'email': email,
        'name': name,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def decode_token(token):
    """Decode JWT token"""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_gemini_response(prompt, image_data=None, mime_type=None):
    """Helper function to call Gemini API"""
    gemini_key = settings.GEMINI_API_KEY
    
    if image_data:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
        contents = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": mime_type, "data": image_data}}
                ]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 4096,
                "responseMimeType": "application/json"
            }
        }
    else:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={gemini_key}"
        contents = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 4096,
                "responseMimeType": "application/json"
            }
        }
    
    try:
        response = requests.post(url, json=contents, headers={"Content-Type": "application/json"}, timeout=60)
        response.raise_for_status()
        data = response.json()
        text_content = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return text_content
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")


@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok", "timestamp": "2024-01-01T00:00:00Z"})


class PatientListCreateView(generics.ListCreateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class ScanReportListCreateView(generics.ListCreateAPIView):
    queryset = ScanReport.objects.all()
    serializer_class = ScanReportSerializer


class ScanReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ScanReport.objects.all()
    serializer_class = ScanReportSerializer


@api_view(['POST'])
def analyze_scan(request):
    try:
        file = request.FILES.get('file')
        test_type = request.data.get('testType', 'Unknown')
        patient_age = request.data.get('patientAge', 'Unknown')
        patient_sex = request.data.get('patientSex', 'Unknown')
        symptoms = request.data.get('symptoms', 'None provided')
        
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert file to base64
        file_content = file.read()
        base64_data = base64.b64encode(file_content).decode('utf-8')
        mime_type = file.content_type
        
        prompt = f"""You are an expert radiologist. Analyze this medical scan and provide a detailed structured report.

Test Type: {test_type}
Patient Age: {patient_age}
Patient Sex: {patient_sex}
Symptoms/Notes: {symptoms}

Provide your response in this exact JSON format:
{{
  "reportTitle": "string",
  "urgency": "routine|urgent|emergency",
  "scanQuality": "string",
  "findings": [
    {{
      "region": "string",
      "observation": "string",
      "severity": "normal|mild|moderate|severe"
    }}
  ],
  "impression": "string",
  "differentialDiagnosis": ["string"],
  "recommendedFollowUp": "string",
  "limitations": "string"
}}

Be thorough and professional."""
        
        text_content = get_gemini_response(prompt, base64_data, mime_type)
        
        try:
            import json
            report = json.loads(text_content)
        except:
            report = {
                "reportTitle": "Medical Imaging Report",
                "urgency": "routine",
                "scanQuality": "Assessed",
                "findings": [{"region": "General", "observation": text_content, "severity": "normal"}],
                "impression": text_content,
                "differentialDiagnosis": [],
                "recommendedFollowUp": "Consult with your healthcare provider",
                "limitations": "AI-generated assessment"
            }
        
        return Response({"report": report})
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def get_advice(request):
    try:
        report = request.data.get('report', {})
        patient_age = request.data.get('patientAge', 'Unknown')
        patient_sex = request.data.get('patientSex', 'Unknown')
        symptoms = request.data.get('symptoms', 'None provided')
        
        prompt = f"""You are a compassionate medical advisor. Based on the following radiologist report, provide personalized patient advice.

Radiologist Report:
{report}

Patient Age: {patient_age}
Patient Sex: {patient_sex}
Symptoms: {symptoms}

Provide your response in this exact JSON format:
{{
  "simpleSummary": "string",
  "whatItMeans": "string",
  "recommendations": ["string"],
  "redFlags": ["string"],
  "specialistReferral": "string",
  "disclaimer": "string"
}}"""
        
        text_content = get_gemini_response(prompt)
        
        try:
            import json
            advice = json.loads(text_content)
        except:
            advice = {
                "simpleSummary": text_content,
                "whatItMeans": "Please consult your healthcare provider for interpretation.",
                "recommendations": ["Schedule a follow-up with your doctor"],
                "redFlags": [],
                "specialistReferral": "Consult your primary care physician",
                "disclaimer": "This is AI-generated advice and not a substitute for professional medical consultation."
            }
        
        return Response({"advice": advice})
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def hepato_analyze(request):
    try:
        file = request.FILES.get('file')
        test_type = request.data.get('testType', 'Unknown')
        patient_age = request.data.get('patientAge', 'Unknown')
        patient_sex = request.data.get('patientSex', 'Unknown')
        symptoms = request.data.get('symptoms', 'None provided')
        alcohol_use = request.data.get('alcoholUse', 'Unknown')
        
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        file_content = file.read()
        base64_data = base64.b64encode(file_content).decode('utf-8')
        mime_type = file.content_type
        
        prompt = f"""You are an expert hepatologist and radiologist specializing in liver diseases. Analyze this liver scan and provide a detailed structured assessment.

Test Type: {test_type}
Patient Age: {patient_age}
Patient Sex: {patient_sex}
Alcohol Use: {alcohol_use}
Symptoms: {symptoms}

Provide JSON format:
{{
  "reportTitle": "Liver Health Assessment Report",
  "severity": "normal|mild|moderate|severe",
  "scanQuality": "string",
  "findings": [{{"parameter": "string", "observation": "string", "status": "normal|mild|moderate|severe"}}],
  "impression": "string",
  "possibleConditions": ["string"],
  "recommendedFollowUp": "string",
  "limitations": "string"
}}"""
        
        text_content = get_gemini_response(prompt, base64_data, mime_type)
        
        try:
            import json
            report = json.loads(text_content)
        except:
            report = {
                "reportTitle": "Liver Health Assessment Report",
                "severity": "normal",
                "scanQuality": "Assessed",
                "findings": [{"parameter": "General", "observation": text_content, "status": "normal"}],
                "impression": text_content,
                "possibleConditions": [],
                "recommendedFollowUp": "Consult with a hepatologist or gastroenterologist",
                "limitations": "AI-generated assessment based on image analysis"
            }
        
        return Response({"report": report})
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def hepato_advice(request):
    try:
        report = request.data.get('report', {})
        patient_age = request.data.get('patientAge', 'Unknown')
        patient_sex = request.data.get('patientSex', 'Unknown')
        symptoms = request.data.get('symptoms', 'None')
        alcohol_use = request.data.get('alcoholUse', 'Unknown')
        
        prompt = f"""You are a hepatology specialist. Provide liver health advice.

Liver Report: {report}
Patient Age: {patient_age}
Alcohol Use: {alcohol_use}
Symptoms: {symptoms}

Provide JSON format:
{{
  "simpleSummary": "string",
  "whatItMeans": "string",
  "recommendations": ["string"],
  "warningSigns": ["string"],
  "specialistReferral": "string",
  "disclaimer": "string"
}}"""
        
        text_content = get_gemini_response(prompt)
        
        try:
            import json
            advice = json.loads(text_content)
        except:
            advice = {
                "simpleSummary": text_content,
                "whatItMeans": "Consult hepatologist",
                "recommendations": ["See liver specialist"],
                "warningSigns": [],
                "specialistReferral": "Hepatologist or Gastroenterologist",
                "disclaimer": "AI-generated, not medical advice"
            }
        
        return Response({"advice": advice})
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
