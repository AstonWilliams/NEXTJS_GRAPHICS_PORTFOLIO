from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework.decorators import throttle_classes
from rest_framework.throttling import AnonRateThrottle
from . import views
from .views import (
    CustomTokenObtainPairView, 
    LogoutView, 
    LogoutAllView, 
    ChangePasswordView,
    SiteSettingsView,
    SessionsView
)

# Update the rate throttle class to be more lenient
class LoginRateThrottle(AnonRateThrottle):
    rate = '20/min'  # Increased from 5/min

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'project-images', views.ProjectImageViewSet)
router.register(r'tags', views.TagViewSet)
router.register(r'messages', views.MessageViewSet)
router.register(r'skills', views.SkillViewSet)
router.register(r'journey', views.JourneyViewSet)
router.register(r'users', views.UserViewSet)

# Apply throttling to token endpoints
token_obtain_pair_throttled = throttle_classes([LoginRateThrottle])(CustomTokenObtainPairView.as_view())
token_refresh_throttled = throttle_classes([LoginRateThrottle])(TokenRefreshView.as_view())

urlpatterns = [
    path('', include(router.urls)),
    # Add custom token endpoints with throttling
    path('token/', token_obtain_pair_throttled, name='token_obtain_pair'),
    path('token/refresh/', token_refresh_throttled, name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('logout-all/', LogoutAllView.as_view(), name='logout_all'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('settings/', SiteSettingsView.as_view(), name='settings'),
    path('sessions/', SessionsView.as_view(), name='sessions'),
]
