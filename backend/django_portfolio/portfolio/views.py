import json
from django.utils.text import slugify
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.core.mail import send_mail
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Project, ProjectImage, Tag, ProjectTag, Message, Skill, Journey
from .serializers import (
    ProjectSerializer, ProjectImageSerializer, TagSerializer,
    MessageSerializer, SkillSerializer, JourneySerializer, UserSerializer
)
from .permissions import IsAdminUserOrReadOnly
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

# Custom token serializer to include user ID
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['user_id'] = user.id
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user ID to response
        data['user_id'] = self.user.id
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LogoutAllView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            tokens = OutstandingToken.objects.filter(user_id=request.user.id)
            for token in tokens:
                _, created = BlacklistedToken.objects.get_or_create(token=token)
            
            return Response({"detail": "Successfully logged out from all devices."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({"detail": "Both current and new password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.check_password(current_password):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            validate_password(new_password, user)
            user.set_password(new_password)
            user.save()
            
            # Blacklist all tokens for this user to force re-login
            tokens = OutstandingToken.objects.filter(user_id=user.id)
            for token in tokens:
                _, created = BlacklistedToken.objects.get_or_create(token=token)
                
            return Response({"detail": "Password changed successfully. Please log in again."}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"detail": list(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ProjectViewSet(viewsets.ModelViewSet):
    """API endpoint for projects"""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    lookup_field = 'id'  # Changed from 'slug' to 'id' for easier frontend integration
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'featured']
    search_fields = ['title', 'description', 'tags__name']
    ordering_fields = ['created_at', 'date', 'title']
    ordering = ['-created_at']  # Default ordering
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_queryset(self):
        """
        Customize queryset based on query parameters.
        This ensures proper filtering for featured projects.
        """
        queryset = Project.objects.all()
        
        # Filter by featured if specified
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            # Convert string to boolean
            is_featured = featured.lower() == 'true'
            queryset = queryset.filter(featured=is_featured)
            
        # Filter by category if specified
        category = self.request.query_params.get('category', None)
        if category is not None and category.lower() != 'all':
            queryset = queryset.filter(category__iexact=category)
            
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    def list(self, request, *args, **kwargs):
        # Disable caching for list view to ensure fresh data
        queryset = self.filter_queryset(self.get_queryset())
        
        # Log the query parameters and result count for debugging
        print(f"Query params: {request.query_params}")
        print(f"Found {queryset.count()} projects")
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        # Disable caching for detail view
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        try:
            # If slug is not provided, generate it from title
            if 'title' in request.data and 'slug' not in request.data:
                request.data._mutable = True
                request.data['slug'] = slugify(request.data['title'])
                request.data._mutable = False
                
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        try:
            # If slug is not provided, generate it from title
            if 'title' in request.data and 'slug' not in request.data:
                request.data._mutable = True
                request.data['slug'] = slugify(request.data['title'])
                request.data._mutable = False
                
            return super().update(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ProjectImageViewSet(viewsets.ModelViewSet):
    """API endpoint for project images"""
    queryset = ProjectImage.objects.all()
    serializer_class = ProjectImageSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    
    @action(detail=True, methods=['post'])
    def set_main(self, request, pk=None):
        """Set this image as the main image for its project"""
        image = self.get_object()
        project = image.project
        
        # Set all other images as not main
        ProjectImage.objects.filter(project=project).update(is_main=False)
        
        # Set this image as main
        image.is_main = True
        image.save()
        
        return Response({'status': 'main image set'})

class TagViewSet(viewsets.ModelViewSet):
    """API endpoint for tags"""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    @method_decorator(cache_page(60*60*24))  # Cache for 24 hours
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class MessageViewSet(viewsets.ModelViewSet):
    """API endpoint for messages"""
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_read']
    ordering_fields = ['created_at']
    
    def get_permissions(self):
        """Allow anyone to create a message, but only admins to view/edit/delete"""
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Send email notification
        try:
            message = serializer.instance
            subject = f"New Contact Form Submission: {message.subject or 'No Subject'}"
            email_body = f"""
            Name: {message.name}
            Email: {message.email}
            Subject: {message.subject or 'No Subject'}
            
            Message:
            {message.message}
            """
            
            admin_email = settings.DEFAULT_FROM_EMAIL or 'admin@example.com'
            send_mail(
                subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [admin_email],
                fail_silently=False,
            )
            
            # Send confirmation email to the user
            user_subject = "Thank you for your message"
            user_message = f"""
            Dear {message.name},
            
            Thank you for reaching out. I have received your message and will get back to you as soon as possible.
            
            Best regards,
            DesignSpace
            """
            
            send_mail(
                user_subject,
                user_message,
                settings.DEFAULT_FROM_EMAIL,
                [message.email],
                fail_silently=False,
            )
            
        except Exception as e:
            # Log the error but don't fail the request
            print(f"Error sending email: {e}")
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class SkillViewSet(viewsets.ModelViewSet):
    """API endpoint for skills"""
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category']
    ordering_fields = ['order', 'name']
    
    @method_decorator(cache_page(60*60))  # Cache for 1 hour
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class JourneyViewSet(viewsets.ModelViewSet):
    """API endpoint for journey items"""
    queryset = Journey.objects.all()
    serializer_class = JourneySerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['journey_type']
    ordering_fields = ['order', 'date']
    
    @method_decorator(cache_page(60*60))  # Cache for 1 hour
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class UserViewSet(viewsets.ModelViewSet):
    """API endpoint for users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user info"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({"detail": "Both current and new password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.check_password(current_password):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            validate_password(new_password, user)
            user.set_password(new_password)
            user.save()
            
            # Blacklist all tokens for this user to force re-login
            tokens = OutstandingToken.objects.filter(user_id=user.id)
            for token in tokens:
                _, created = BlacklistedToken.objects.get_or_create(token=token)
                
            return Response({"detail": "Password changed successfully. Please log in again."}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"detail": list(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SiteSettingsView(APIView):
    """API endpoint for site settings"""
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        """Get site settings"""
        # You can implement this to fetch settings from a database or file
        settings = {
            "site_title": "DesignSpace",
            "site_description": "A showcase of innovative graphic design work across typography, print, and digital media.",
            "contact_email": settings.DEFAULT_FROM_EMAIL,
        }
        return Response(settings)
    
    def post(self, request):
        """Update site settings"""
        # You can implement this to update settings in a database or file
        # For now, we'll just return a success message
        return Response({"detail": "Settings updated successfully."}, status=status.HTTP_200_OK)

class SessionsView(APIView):
    """API endpoint for managing user sessions"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all active sessions for the current user"""
        tokens = OutstandingToken.objects.filter(user_id=request.user.id)
        active_tokens = []
        
        for token in tokens:
            # Check if token is blacklisted
            is_blacklisted = BlacklistedToken.objects.filter(token=token).exists()
            if not is_blacklisted:
                active_tokens.append({
                    "id": token.id,
                    "created_at": token.created_at,
                    "expires_at": token.expires_at,
                    "jti": token.jti,
                    "current": token.jti == request.auth.payload.get('jti')
                })
        
        return Response(active_tokens)
    
    def delete(self, request):
        """Revoke a specific session"""
        token_id = request.data.get('token_id')
        if not token_id:
            return Response({"detail": "Token ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = OutstandingToken.objects.get(id=token_id, user_id=request.user.id)
            BlacklistedToken.objects.get_or_create(token=token)
            return Response({"detail": "Session revoked successfully."}, status=status.HTTP_200_OK)
        except OutstandingToken.DoesNotExist:
            return Response({"detail": "Token not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
