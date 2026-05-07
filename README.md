# E-Services État Civil

Un système complet de gestion e-services pour l'état civil permettant de gérer les demandes de copies et d'extraits d'actes de naissance, de mariage et de décès.

## Architecture

Le projet est basé sur **Django 5.0** avec une architecture modulaire :
- `apps.accounts`: Gestion des utilisateurs (Citoyens et Agents) et authentification.
- `apps.core`: Logique métier, gestion des dossiers, notifications et génération de documents.

## Fonctionnalités Principales

- **Citoyens**: Inscription, soumission de dossiers avec upload sécurisé, suivi en temps réel.
- **Agents**: Back-office complet, filtrage par statut/date, recherche globale, validation/rejet.
- **Documents**: Génération automatique d'extraits au format PDF via **WeasyPrint**.
- **Notifications**: Système d'alertes en temps réel et notifications par email (configurable).
- **Performance**: Pagination optimisée et requêtes filtrées.

## Installation Locale

1. **Cloner le projet**
2. **Installer les dépendances**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configurer l'environnement**
   Créez un fichier `.env` à la racine :
   ```env
   DEBUG=True
   SECRET_KEY=votre_cle_secrete
   DATABASE_URL=postgres://user:password@localhost:5432/dbname
   ```
4. **Appliquer les migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. **Lancer le serveur**
   ```bash
   python manage.py runserver
   ```

## Génération de PDF
La librairie utilisée est `WeasyPrint`. Elle nécessite des dépendances système (pango, cairo, gdk-pixbuf) pour fonctionner correctement. Consultez la documentation officielle pour votre OS.
