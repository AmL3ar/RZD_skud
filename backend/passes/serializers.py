from rest_framework import serializers
from .models import Pass, Department, PassTemplate

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class PassTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassTemplate
        fields = '__all__'

class PassSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    template_name = serializers.ReadOnlyField(source='template.name', allow_null=True)
    
    class Meta:
        model = Pass
        fields = ['id', 'full_name', 'department', 'department_name', 'purpose', 
                 'date_issued', 'valid_until', 'email', 'template', 'template_name',
                 'generated_document', 'is_archived']
        read_only_fields = ['generated_document', 'is_archived']

class PassCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pass
        fields = ['full_name', 'department', 'purpose', 'valid_until', 'email', 'template']

class PassActionSerializer(serializers.Serializer):
    pass_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=['generate', 'email', 'print'])

    def validate_pass_id(self, value):
        try:
            pass_obj = Pass.objects.get(id=value)
            return value
        except Pass.DoesNotExist:
            raise serializers.ValidationError("Pass with this ID does not exist.") 