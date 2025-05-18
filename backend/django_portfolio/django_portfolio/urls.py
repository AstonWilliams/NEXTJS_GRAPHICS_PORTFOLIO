"""
URL configuration for django_portfolio project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from portfolio.views import (
    ProjectViewSet, ProjectImageViewSet, TagViewSet, MessageViewSet,
    SkillViewSet, JourneyViewSet, CustomTokenObtainPairView, LogoutView,
    LogoutAllView, ChangePasswordView, UserViewSet, SiteSettingsView,
    SessionsView
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

router = routers.DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'project-images', ProjectImageViewSet)
router.register(r'tags', TagViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'journey', JourneyViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/logout/', LogoutView.as_view(), name='auth_logout'),
    path('api/logout-all/', LogoutAllView.as_view(), name='auth_logout_all'),
    path('api/change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('api/settings/', SiteSettingsView.as_view(), name='site_settings'),
    path('api/sessions/', SessionsView.as_view(), name='user_sessions'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
