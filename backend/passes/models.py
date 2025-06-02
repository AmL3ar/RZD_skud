from django.db import models
import os
from django.core.mail import EmailMessage
from django.conf import settings
from docxtpl import DocxTemplate
import uuid
from datetime import datetime
import subprocess

class PassTemplate(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название')
    description = models.TextField(blank=True, null=True, verbose_name='Описание')
    template_file = models.FileField(upload_to='templates/', verbose_name='Файл шаблона')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    
    def __str__(self):
        return self.name
        
    class Meta:
        verbose_name = 'Шаблон пропуска'
        verbose_name_plural = 'Шаблоны пропусков'

class Department(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название')

    def __str__(self):
        return self.name
        
    class Meta:
        verbose_name = 'Отдел'
        verbose_name_plural = 'Отделы'

class Person(models.Model):
    full_name = models.CharField(max_length=255, verbose_name='ФИО')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, verbose_name='Отдел')
    email = models.EmailField(blank=True, null=True, verbose_name='Email')
    
    def __str__(self):
        return f'{self.full_name} ({self.department})'
    
    class Meta:
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'
        ordering = ['full_name']

class Pass(models.Model):
    full_name = models.CharField(max_length=255, verbose_name='ФИО')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, verbose_name='Отдел')
    purpose = models.TextField(verbose_name='Цель')
    date_issued = models.DateTimeField(auto_now_add=True, verbose_name='Дата выдачи')
    valid_until = models.DateTimeField(verbose_name='Действителен до')
    email = models.EmailField(verbose_name='Email')
    template = models.ForeignKey(PassTemplate, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Шаблон')
    generated_document = models.FileField(upload_to='passes/', null=True, blank=True, verbose_name='Сгенерированный документ')
    is_archived = models.BooleanField(default=False, verbose_name='Архивирован')
    
    def __str__(self):
        return f'{self.full_name} ({self.department})'
        
    class Meta:
        verbose_name = 'Пропуск'
        verbose_name_plural = 'Пропуски'

    def convert_to_pdf(self):
        if not self.generated_document:
            self.generate_document()
        
        docx_path = self.generated_document.path
        output_dir = os.path.dirname(docx_path) 

        command = [
            'libreoffice',
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', output_dir,
            docx_path
        ]
        print(f"Выполняется команда конвертации: {' '.join(command)}")
        subprocess.run(command, check=True)

        pdf_filename = os.path.splitext(os.path.basename(docx_path))[0] + '.pdf'
        pdf_relative_path = os.path.join('passes', pdf_filename)
        
        return pdf_relative_path
    
    def generate_document(self):
        if not self.template:
            # Use default template
            template_path = os.path.join(settings.BASE_DIR, '../templates/Blank_razovogo_propuska.docx')
        else:
            template_path = self.template.template_file.path
            
        doc = DocxTemplate(template_path)
        
        # Prepare context for the template
        context = {
            'full_name': self.full_name,
            'department': self.department.name,
            'purpose': self.purpose,
            'date_issued': self.date_issued.strftime('%d.%m.%Y'),
            'valid_until': self.valid_until.strftime('%d.%m.%Y'),
            'pass_id': str(self.id),
            'time_to': self.valid_until.strftime('%H:%M'),
        }
        
        # Render the document
        doc.render(context)
        
        # Save the document
        filename = f"pass_{self.id}_{uuid.uuid4().hex[:8]}.docx"
        output_path = os.path.join(settings.MEDIA_ROOT, 'passes', filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        doc.save(output_path)
        
        # Update the model
        self.generated_document = f'passes/{filename}'
        self.save(update_fields=['generated_document'])
        
        return self.generated_document
    
    def send_email(self):
        if not self.generated_document:
            self.generate_document()
            
        email = EmailMessage(
            subject=f'Пропуск для {self.full_name}',
            body=f'Созданный пропуск на {self.valid_until.strftime("%d.%m.%Y")}.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[self.email],
        )
        
        # Attach the document
        document_path = os.path.join(settings.MEDIA_ROOT, str(self.generated_document))
        email.attach_file(document_path)
        
        # Send the email
        return email.send()
