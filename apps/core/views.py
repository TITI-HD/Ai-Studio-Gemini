import io
from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.db.models import Q
from django.core.mail import send_mail
from weasyprint import HTML

from .models import Dossier, Extrait, Notification

class CitizenDashboardView(LoginRequiredMixin, ListView):
    model = Dossier
    template_name = 'core/citizen_dashboard.html'
    context_object_name = 'dossiers'
    paginate_by = 10

    def get_queryset(self):
        queryset = Dossier.objects.filter(demandeur=self.request.user)
        # Search functionality
        search_query = self.request.GET.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(id__icontains=search_query) |
                Q(type_acte__icontains=search_query)
            )
        return queryset

    def get_paginate_by(self, queryset):
        return self.request.GET.get('paginate_by', self.paginate_by)

class AgentDashboardView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Dossier
    template_name = 'core/agent_dashboard.html'
    context_object_name = 'dossiers'
    paginate_by = 10

    def test_func(self):
        return self.request.user.is_agent

    def get_queryset(self):
        queryset = Dossier.objects.all()
        
        # Filtering
        statut = self.request.GET.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
            
        date_soumission = self.request.GET.get('date')
        if date_soumission:
            queryset = queryset.filter(date_soumission__date=date_soumission)
            
        # Search
        q = self.request.GET.get('q')
        if q:
            queryset = queryset.filter(
                Q(id__icontains=q) |
                Q(demandeur__first_name__icontains=q) |
                Q(demandeur__last_name__icontains=q)
            )
            
        return queryset

    def get_paginate_by(self, queryset):
        return self.request.GET.get('paginate_by', self.paginate_by)

class DossierCreateView(LoginRequiredMixin, CreateView):
    model = Dossier
    fields = ['type_acte', 'piece_justificative', 'commentaire', 'priorite']
    template_name = 'core/dossier_form.html'
    success_url = reverse_lazy('core:citizen_dashboard')

    def form_valid(self, form):
        form.instance.demandeur = self.request.user
        response = super().form_valid(form)
        
        # Notify agents
        from apps.accounts.models import User
        agents = User.objects.filter(is_agent=True)
        for agent in agents:
            Notification.objects.create(
                user=agent,
                message=f"Nouveau dossier #{self.object.id} soumis par {self.request.user.get_full_name()}."
            )
        return response

class DossierDetailView(LoginRequiredMixin, DetailView):
    model = Dossier
    template_name = 'core/dossier_detail.html'

class DossierUpdateStatusView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Dossier
    fields = ['statut', 'commentaire']
    template_name = 'core/dossier_status_form.html'

    def test_func(self):
        return self.request.user.is_agent

    def form_valid(self, form):
        response = super().form_valid(form)
        dossier = self.object
        
        # Notify citizen
        Notification.objects.create(
            user=dossier.demandeur,
            message=f"Le statut de votre dossier #{dossier.id} est maintenant: {dossier.get_statut_display()}."
        )
        
        # Send Email
        try:
            send_mail(
                f"Mise à jour Dossier #{dossier.id}",
                f"Bonjour {dossier.demandeur.first_name}, le statut de votre demande a été mis à jour: {dossier.get_statut_display()}.",
                'services@etatcivil.gouv',
                [dossier.demandeur.email],
                fail_silently=True,
            )
        except Exception:
            pass
            
        return response

def generate_pdf_extrait(request, pk):
    dossier = get_object_or_404(Dossier, pk=pk)
    
    # Security check
    if not request.user.is_agent:
        return HttpResponse("Non autorisé", status=403)
    
    # Gather data for PDF
    context = {
        'dossier': dossier,
        'date': timezone.now(),
    }
    
    html_string = render_to_string('core/pdf_template.html', context)
    html = HTML(string=html_string)
    result = html.write_pdf()
    
    # Save or return PDF
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename=extrait_{dossier.id}.pdf'
    response.write(result)
    
    # Save to Extrait model if validated
    if dossier.statut == 'VALIDE':
        Extrait.objects.get_or_create(
            dossier=dossier,
            defaults={'genere_par': request.user}
        )
        
    return response
