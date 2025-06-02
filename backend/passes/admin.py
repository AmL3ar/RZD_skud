from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from .models import Pass, Department, PassTemplate, Person

# Регистрация модели PassTemplate
@admin.register(PassTemplate)
class PassTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')

# Регистрация модели Department
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

# Регистрация модели Person
@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'department', 'email')
    list_filter = ('department',)
    search_fields = ('full_name', 'department__name', 'email')
    autocomplete_fields = ['department']

# Регистрация модели Pass с автозаполнением
@admin.register(Pass)
class PassAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'department', 'date_issued', 'valid_until', 'is_archived')
    list_filter = ('department', 'date_issued', 'valid_until', 'is_archived')
    search_fields = ('full_name', 'department__name', 'purpose', 'email')
    readonly_fields = ('date_issued', 'generated_document')
    autocomplete_fields = ['department']
    
    # Добавляем JavaScript для автозаполнения имен
    class Media:
        js = ('admin/js/autocomplete.js',)
    
    # Добавляем URL для автозаполнения имен
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('autocomplete-name/', self.admin_site.admin_view(self.autocomplete_name), name='passes_pass_autocomplete_name'),
            path('autocomplete-person/', self.admin_site.admin_view(self.autocomplete_person), name='passes_pass_autocomplete_person'),
        ]
        return custom_urls + urls
    
    # Функция для автозаполнения имен из существующих пропусков
    def autocomplete_name(self, request):
        term = request.GET.get('term', '')
        if term:
            # Получаем уникальные имена из базы данных, которые начинаются с введенного текста
            names = Pass.objects.filter(full_name__istartswith=term)\
                .values_list('full_name', flat=True).distinct()
            # Возвращаем результаты в формате JSON
            return JsonResponse(list(names), safe=False)
        return JsonResponse([], safe=False)
    
    # Функция для автозаполнения имен из модели Person
    def autocomplete_person(self, request):
        term = request.GET.get('term', '')
        department_id = request.GET.get('department_id', None)
        
        if term:
            # Базовый запрос для поиска людей
            query = Person.objects.filter(full_name__istartswith=term)
            
            # Если указан отдел, фильтруем по нему
            if department_id and department_id.isdigit():
                query = query.filter(department_id=int(department_id))
            
            # Получаем данные о людях
            persons = query.values('id', 'full_name', 'department__name', 'email')
            
            # Форматируем результаты
            results = [{
                'id': person['id'],
                'full_name': person['full_name'],
                'department': person['department__name'],
                'email': person['email'] or ''
            } for person in persons]
            
            return JsonResponse(results, safe=False)
        return JsonResponse([], safe=False)