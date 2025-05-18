from rest_framework import serializers
from .models import Project, ProjectImage, Tag, ProjectTag, Message, Skill, Journey
from django.contrib.auth.models import User
from django.utils.text import slugify
import json

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'is_main', 'alt_text', 'order']

class ProjectSerializer(serializers.ModelSerializer):
    images = ProjectImageSerializer(many=True, read_only=True)
    tags = serializers.SerializerMethodField()
    slug = serializers.CharField(required=False)  # Make slug optional
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'slug', 'category', 'description', 'client', 
                  'date', 'created_at', 'updated_at', 'featured', 'images', 'tags']
    
    def get_tags(self, obj):
        project_tags = ProjectTag.objects.filter(project=obj)
        return [pt.tag.name for pt in project_tags]
    
    def validate(self, attrs):
        # Generate slug from title if not provided
        if 'title' in attrs and 'slug' not in attrs:
            attrs['slug'] = slugify(attrs['title'])
        return attrs
    
    def create(self, validated_data):
        # Extract tags and images from request data
        request = self.context.get('request')
        tags_data = request.POST.getlist('tags', [])
        images_data = request.FILES.getlist('images', [])
        
        # Create project
        project = Project.objects.create(**validated_data)
        
        # Add tags
        for tag_name in tags_data:
            if tag_name:  # Only process non-empty tags
                tag, created = Tag.objects.get_or_create(name=tag_name.strip())
                ProjectTag.objects.create(project=project, tag=tag)
        
        # Add images
        for i, image_data in enumerate(images_data):
            is_main = i == 0  # First image is main by default
            ProjectImage.objects.create(
                project=project, 
                image=image_data, 
                is_main=is_main,
                order=i
            )
        
        return project
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags if provided
        if 'tags' in request.data:
            tags_data = request.POST.getlist('tags', [])
            # Remove existing tags
            ProjectTag.objects.filter(project=instance).delete()
            # Add new tags
            for tag_name in tags_data:
                if tag_name:  # Only process non-empty tags
                    tag, created = Tag.objects.get_or_create(name=tag_name.strip())
                    ProjectTag.objects.create(project=instance, tag=tag)
        
        # Update images if provided
        if request.FILES:
            images_data = request.FILES.getlist('images', [])
            existing_images = request.POST.get('existing_images')
            
            # If replace_images flag is set or existing_images is provided, handle existing images
            if request.POST.get('replace_images') == 'true' or existing_images:
                if existing_images:
                    # Keep only the specified existing images
                    try:
                        existing_image_ids = json.loads(existing_images)
                        ProjectImage.objects.filter(project=instance).exclude(id__in=existing_image_ids).delete()
                    except (ValueError, json.JSONDecodeError):
                        # If JSON parsing fails, don't delete any images
                        pass
                else:
                    # Remove all existing images
                    ProjectImage.objects.filter(project=instance).delete()
            
            # Add new images
            if images_data:
                current_max_order = ProjectImage.objects.filter(project=instance).order_by('-order').first()
                start_order = (current_max_order.order + 1) if current_max_order else 0
                
                for i, image_data in enumerate(images_data):
                    is_main = False
                    if request.POST.get('main_image_id') == 'new' and i == 0:
                        # If the first new image should be the main image
                        is_main = True
                        # Set all existing images as not main
                        ProjectImage.objects.filter(project=instance).update(is_main=False)
                    
                    ProjectImage.objects.create(
                        project=instance, 
                        image=image_data, 
                        is_main=is_main,
                        order=start_order + i
                    )
            
            # Set main image if specified
            main_image_id = request.POST.get('main_image_id')
            if main_image_id and main_image_id != 'new':
                try:
                    # Set all images as not main
                    ProjectImage.objects.filter(project=instance).update(is_main=False)
                    # Set the specified image as main
                    ProjectImage.objects.filter(id=int(main_image_id), project=instance).update(is_main=True)
                except (ValueError, ProjectImage.DoesNotExist):
                    pass
        
        return instance

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read']
        read_only_fields = ['created_at']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'icon', 'category', 'order']

class JourneySerializer(serializers.ModelSerializer):
    class Meta:
        model = Journey
        fields = ['id', 'title', 'subtitle', 'date', 'description', 'journey_type', 'order']
