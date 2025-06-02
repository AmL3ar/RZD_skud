from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from django.conf.urls.static import static
 
@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'admin': '/admin/',
        'passes': '/api/passes/',
        'users': '/api/users/',
        'templates': '/api/passes/templates/',
    })
 
urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    path('admin/', admin.site.urls),
    path('api/', api_root),
    path('api/passes/', include('passes.urls')),
    path('api/users/', include('users.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 