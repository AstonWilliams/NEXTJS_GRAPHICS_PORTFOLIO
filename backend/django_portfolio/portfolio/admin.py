from django.contrib import admin
from .models import Project, ProjectImage, Tag, ProjectTag, Message, Skill, Journey

class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1

class ProjectTagInline(admin.TabularInline):
    model = ProjectTag
    extra = 1

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'date', 'featured', 'created_at')
    list_filter = ('category', 'featured')
    search_fields = ('title', 'description', 'client')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProjectImageInline, ProjectTagInline]

@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ('project', 'is_main', 'order')
    list_filter = ('is_main', 'project')

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at',)

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'order')
    list_filter = ('category',)
    search_fields = ('name',)

@admin.register(Journey)
class JourneyAdmin(admin.ModelAdmin):
    list_display = ('title', 'subtitle', 'date', 'journey_type', 'order')
    list_filter = ('journey_type',)
    search_fields = ('title', 'subtitle', 'description')
