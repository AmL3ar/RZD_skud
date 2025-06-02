from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse, FileResponse
from django.shortcuts import get_object_or_404
import os
from django.conf import settings

from .models import Pass, Department, PassTemplate
from .serializers import (
    PassSerializer, 
    DepartmentSerializer, 
    PassTemplateSerializer, 
    PassCreateSerializer,
    PassActionSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

class PassTemplateViewSet(viewsets.ModelViewSet):
    queryset = PassTemplate.objects.all()
    serializer_class = PassTemplateSerializer
    permission_classes = [IsAuthenticated]

class PassViewSet(viewsets.ModelViewSet):
    queryset = Pass.objects.all()
    serializer_class = PassSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PassCreateSerializer
        return PassSerializer
    
    @action(detail=True, methods=['post'])
    def generate_document(self, request, pk=None):
        pass_obj = self.get_object()
        document_path = pass_obj.generate_document()
        return Response({'status': 'document generated', 'document': document_path.url})
    
    @action(detail=True, methods=['post'], url_path='send_email')
    def send_email(self, request, pk=None):
        pass_obj = self.get_object()
        try:
            pass_obj.send_email()
            return Response({'status': 'email sent'})
        except Exception as e:
            print(f"!!! ОШИБКА ОТПРАВКИ EMAIL: {e}")
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        pass_obj = self.get_object()
        if not pass_obj.generated_document:
            pass_obj.generate_document()
        
        document_path = os.path.join(settings.MEDIA_ROOT, str(pass_obj.generated_document))
        if os.path.exists(document_path):
            with open(document_path, 'rb') as file:
                response = HttpResponse(file.read(), content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                response['Content-Disposition'] = f'attachment; filename="pass_{pass_obj.id}.docx"'
                return response
        return Response({'status': 'error', 'message': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)


    @action(detail=True, methods=['post'], url_path='print')
    def print_pass(self, request, pk=None):
        pass_obj = self.get_object()
        try:
            pdf_relative_path = pass_obj.convert_to_pdf()
            
            pdf_url = request.build_absolute_uri(settings.MEDIA_URL + pdf_relative_path)
            
            return Response({
                'status': 'ready for print',
                'document': pdf_url
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'status': 'error', 'message': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def perform_action(self, request):
        serializer = PassActionSerializer(data=request.data)
        if serializer.is_valid():
            pass_id = serializer.validated_data['pass_id']
            action = serializer.validated_data['action']
            
            pass_obj = get_object_or_404(Pass, id=pass_id)
            
            if action == 'generate':
                document_path = pass_obj.generate_document()
                return Response({'status': 'document generated', 'document': document_path.url})
            elif action == 'email':
                try:
                    pass_obj.send_email()
                    return Response({'status': 'email sent'})
                except Exception as e:
                    return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            elif action == 'print':
                if not pass_obj.generated_document:
                    pass_obj.generate_document()
                return Response({'status': 'ready for print', 'document': pass_obj.generated_document.url})
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 
