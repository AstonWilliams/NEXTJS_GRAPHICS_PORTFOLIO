from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.utils.text import slugify

class Project(models.Model):
    """Model for portfolio projects"""
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=100)
    description = models.TextField()
    client = models.CharField(max_length=200, blank=True, null=True)
    date = models.CharField(max_length=50)  # Could be "2023", "Jan 2023", etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    featured = models.BooleanField(default=False)
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Generate slug from title if not provided
        if not self.slug:
            self.slug = slugify(self.title)
            
            # Ensure slug is unique
            original_slug = self.slug
            count = 1
            while Project.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{count}"
                count += 1
                
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-created_at']

class ProjectImage(models.Model):
    """Images associated with projects"""
    project = models.ForeignKey(Project, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='projects/')
    is_main = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Image for {self.project.title}"
    
    class Meta:
        ordering = ['order']

class Tag(models.Model):
    """Tags for projects"""
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class ProjectTag(models.Model):
    """Many-to-many relationship between projects and tags"""
    project = models.ForeignKey(Project, related_name='project_tags', on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, related_name='project_tags', on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.project.title} - {self.tag.name}"
    
    class Meta:
        unique_together = ('project', 'tag')

class Message(models.Model):
    """Contact form submissions"""
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True, null=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Message from {self.name} - {self.created_at.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-created_at']

class Skill(models.Model):
    """Skills to showcase"""
    name = models.CharField(max_length=100)
    icon = models.ImageField(upload_to='skills/', blank=True, null=True)
    category = models.CharField(max_length=100, blank=True)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['order']

class Journey(models.Model):
    """Career/education journey items"""
    JOURNEY_TYPES = (
        ('work', 'Work'),
        ('education', 'Education'),
        ('award', 'Award'),
    )
    
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200)
    date = models.CharField(max_length=100)
    description = models.TextField()
    journey_type = models.CharField(max_length=20, choices=JOURNEY_TYPES)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.title} - {self.date}"
    
    class Meta:
        ordering = ['order']
        verbose_name_plural = "Journey Items"
