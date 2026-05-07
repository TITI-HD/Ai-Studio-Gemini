import os
import uuid
from django.db import models
from django.conf import settings
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

def dossier_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}_{int(timezone.now().timestamp())}.{ext}"
    return os.path.join('dossiers', str(instance.demandeur.id), filename)

class Dossier(models.Model):
    TYPE_ACTE_CHOICES = [
        ('NAISSANCE', 'Acte de Naissance'),
        ('MARIAGE', 'Acte de Mariage'),
        ('DECES', 'Acte de Décès'),
    ]
    
    STATUT_CHOICES = [
        ('ATTENTE', 'En attente'),
        ('EN_COURS', 'En cours'),
        ('VALIDE', 'Validé'),
        ('REJETE', 'Rejeté'),
    ]
    
    type_acte = models.CharField(max_length=20, choices=TYPE_ACTE_CHOICES)
    date_soumission = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='ATTENTE')
    demandeur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dossiers')
    piece_justificative = models.FileField(upload_path=dossier_upload_path)
    commentaire = models.TextField(blank=True, null=True)
    priorite = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-priorite', '-date_soumission']
        verbose_name = "Dossier"
        verbose_name_plural = "Dossiers"

    def __str__(self):
        return f"Dossier {self.id} - {self.get_type_acte_display()} - {self.demandeur.get_full_name()}"

    def get_absolute_url(self):
        return reverse('core:dossier_detail', kwargs={'pk': self.pk})

class Extrait(models.Model):
    dossier = models.OneToOneField(Dossier, on_delete=models.CASCADE, related_name='extrait')
    fichier_pdf = models.FileField(upload_to='extraits_pdf/')
    date_generation = models.DateTimeField(auto_now_add=True)
    genere_par = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Extrait pour Dossier {self.dossier.id}"

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    lu = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_creation']
