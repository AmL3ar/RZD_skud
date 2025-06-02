from rest_framework.routers import DefaultRouter
from .views import PassViewSet, DepartmentViewSet, PassTemplateViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'passes', PassViewSet, basename='pass')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'templates', PassTemplateViewSet, basename='template')

urlpatterns = [
    path('', include(router.urls)),
] 