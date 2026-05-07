from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    is_citizen = models.BooleanField(default=True)
    is_agent = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.username

class AgentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    matricule = models.CharField(max_length=50, unique=True)
    centre_etat_civil = models.CharField(max_length=100)
    
    def __str__(self):
        return f"Agent {self.matricule} - {self.user.get_full_name()}"
