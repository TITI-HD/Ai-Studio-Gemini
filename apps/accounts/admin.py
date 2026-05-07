from django.contrib import admin
from .models import User, AgentProfile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_citizen', 'is_agent', 'is_staff')
    list_filter = ('is_citizen', 'is_agent', 'is_staff')

@admin.register(AgentProfile)
class AgentProfileAdmin(admin.ModelAdmin):
    list_display = ('matricule', 'user', 'centre_etat_civil')
