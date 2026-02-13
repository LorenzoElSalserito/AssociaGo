# 2. Gestion des Membres (Members)

La section **Membres** est le cœur d'AssociaGo. Ici, vous pouvez gérer le registre complet de tous les membres.

## 2.1 Liste des Membres
Le tableau principal affiche :
- **Nom et Prénom**
- **Email**
- **Statut** : (Actif, Expiré, Suspendu)
- **Expiration de l'Adhésion** : Date de fin de validité de l'inscription.
- **Rôle** : (Membre, Président, Secrétaire, etc.)

### Filtres et Recherche
Utilisez la barre de recherche en haut pour trouver rapidement un membre en tapant son nom, prénom ou numéro de membre.

## 2.2 Ajouter un Nouveau Membre
En cliquant sur **"Ajouter un Membre"**, un formulaire détaillé s'ouvre, divisé en sections :

### Données Personnelles
- **Nom et Prénom** : Obligatoires.
- **Date de Naissance** : Fondamentale pour le calcul du Code Fiscal (en Italie).
- **Sexe** : Homme/Femme.
- **Lieu de Naissance** : Commune ou pays étranger.
- **Code Cadastral** : (ex. H501 pour Rome). Nécessaire pour le calcul automatique du CF.

### Code Fiscal
Le système inclut un **calculateur automatique**. En saisissant les données personnelles et en cliquant sur "Calculer", le champ sera rempli automatiquement. Il est toujours possible de le modifier manuellement.

### Contacts et Adresse
- **Email et Téléphone** : Pour les communications.
- **Adresse Complète** : Rue, Ville, Code Postal.

### Données Associatives
- **Numéro de Membre** : Attribué manuellement ou automatiquement si configuré.
- **Rôle** : Définit les permissions et la charge sociale.
- **Date d'Adhésion** : Date d'entrée dans l'association.

### Enregistrement du Paiement Contextuel
Au bas du formulaire, il y a l'option **"Enregistrer le Paiement de la Cotisation"**.
Si sélectionnée :
1.  Les champs pour le montant (par défaut configurable) et la méthode de paiement sont activés.
2.  Lors de l'enregistrement, le système crée **automatiquement** une transaction entrante dans la comptabilité, liée au nouveau membre.

## 2.3 Actions sur le Membre
Pour chaque ligne du tableau, trois actions rapides sont disponibles :
1.  **Renouveler (Icône Recharger)** : Prolonge la validité de la carte d'un an (ou de la période configurée) et met à jour le statut à "Actif".
2.  **Modifier (Icône Crayon)** : Ouvre le formulaire pour mettre à jour les données.
3.  **Supprimer (Icône Corbeille)** : Supprime le membre (action irréversible, mais conservée dans les journaux).

## 2.4 Impression de la Carte de Membre
Depuis la liste ou la vue détaillée, vous pouvez télécharger le **PDF de la Carte de Membre**, prêt à l'impression, complet avec le logo de l'association et les données du membre.
