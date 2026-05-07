from django.contrib import admin
from .models import Dossier, Extrait, Notification

@admin.register(Dossier)
class DossierAdmin(admin.ModelAdmin):
    list_display = ('id', 'type_acte', 'demandeur', 'statut', 'priorite', 'date_soumission')
    list_filter = ('statut', 'priorite', 'type_acte', 'date_soumission')
    search_fields = ('demandeur__username', 'demandeur__first_name', 'demandeur__last_name', 'id')
    actions = ['marquer_comme_valide']

    def marquer_comme_valide(self, request, queryset):
        queryset.update(statut='VALIDE')
    marquer_comme_valide.short_description = "Valider les dossiers sélectionnés"

@admin.register(Extrait)
class ExtraitAdmin(admin.ModelAdmin):
    list_display = ('dossier', 'date_generation', 'genere_par')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'lu', 'date_creation')
    list_filter = ('lu', 'date_creation')
