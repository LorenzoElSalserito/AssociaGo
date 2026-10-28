# 3. Gestion des Activités

La page **Activités et Coupons** comporte deux onglets : **Activités** (cours, ateliers, séminaires) et **Coupons** (voir chapitre 9).

## 3.1 Liste des activités

Pour chaque activité, le tableau affiche :
- le nom et la catégorie ;
- la période (date de début et de fin) ;
- le nombre maximal de participants, ou « Illimité » s'il n'y a pas de limite ;
- le statut.

**Rechercher des activités...** filtre par nom. Les actions de chaque ligne sont **Voir les détails**, **Modifier** et **Supprimer**.

## 3.2 Créer une activité

Appuyez sur **Ajouter une Activité**.

### Données principales
- **Nom de l'Activité** et **Catégorie** sont obligatoires. Les catégories sont Cours, Atelier, Séminaire et Autre.
- **Description** et **Lieu**.
- **Date de Début** (obligatoire), **Date de Fin**, **Heure de Début** et **Heure de Fin**.
- **Détails de l'Horaire** : note libre, par exemple « Lun/Mer 18-20 ».

### Inscription et coûts
- **Coût** et **Type d'Abonnement** : Unique, Mensuel ou Annuel.
- **Max Participants** : laissez-le vide s'il n'y a pas de limite.
- **Inscription Requise** et **Générer une Facture**.
- **Chemin/URL du Document** et **Chemin/URL de l'Image**, pour joindre du matériel.

Appuyez sur **Enregistrer l'Activité** pour confirmer.

## 3.3 Fiche détaillée

En haut, quatre indicateurs : **Participants**, **Revenus**, **Coûts** et **Bénéfice Net**. En dessous se trouvent six onglets.

### Participants
**Ajouter un Participant** ouvre la liste des membres (**Sélectionner un Membre**) et un champ facultatif **Code promo** (voir 9.3). Le montant dû est le coût de l'activité, moins l'éventuelle réduction. Le tableau affiche le statut et le paiement de chaque participant (Payé, En attente) avec le montant dû et, le cas échéant, le coupon utilisé et la réduction ; il permet aussi de le retirer.

Dans les **Revenus**, les cotisations pas encore payées comptent pour le montant dû, réduction déjà déduite.

### Calendrier
**Ajouter un Horaire** enregistre les séances récurrentes : jour de la semaine, heure de début et de fin, lieu (facultatif).

### Instructeurs
**Ajouter un Instructeur** enregistre :
- le prénom et le nom (obligatoires), l'email, le téléphone ;
- **Spécialisation** et **Certifications** (ex. CONI, FIGC) ;
- **Type de rémunération** (Horaire, Forfait ou Pourcentage) et le montant.

### Coûts
**Ajouter un Coût** enregistre les dépenses de l'activité :
- description, montant et date (obligatoires) ;
- catégorie : Matériel, Équipement, Personnel, Location / Lieu, Marketing, Autre ;
- fournisseur, **Coût Récurrent** et notes.

Les coûts entrent dans le calcul du Bénéfice Net.

### Certificats
Choisissez un modèle et appuyez sur **Émission groupée** pour émettre une attestation à chaque participant actif inscrit en tant que membre. Les modèles se créent dans la section Attestations (chapitre 11).

### Importation CSV
Importez les participants depuis un fichier CSV :
1. téléchargez le format d'exemple ;
2. appuyez sur **Générer l'aperçu**, qui affiche les lignes valides, ignorées et les erreurs ;
3. appuyez sur **Confirmer l'importation**.

## 3.4 Rapport

Le bouton **Rapport** télécharge un PDF récapitulatif de l'activité : données principales et nombre de participants.
