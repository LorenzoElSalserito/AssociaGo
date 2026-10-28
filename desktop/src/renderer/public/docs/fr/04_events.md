# 4. Gestion des Événements

La page **Événements et Coupons** contient deux onglets : **Événements** (fêtes, réunions, collectes de fonds, conférences) et **Coupons** (voir chapitre 9).

## 4.1 Liste des événements

Pour chaque événement, le tableau affiche :
- le titre ;
- la date ;
- le lieu ;
- le statut.

**Rechercher des événements...** filtre la liste. Chaque ligne propose les actions **Voir les détails**, **Modifier** et **Supprimer**.

## 4.2 Créer un événement

Appuyez sur **Ajouter un Événement** et remplissez :
- **Nom de l'Événement** et **Type**, tous deux obligatoires. Les types sont Réunion / Assemblée, Fête, Collecte de fonds, Congrès, Conférence, Autre.
- **Statut** : Planifié, Confirmé, En cours, Terminé ou Annulée. Les événements annulés n'apparaissent pas parmi les événements à venir du Tableau de bord.
- **Date de Début** (obligatoire), **Heure de Début**, **Date de Fin**, **Heure de Fin**.
- **Lieu**, **Adresse** et **Description**.
- **Coût Membre** et **Coût Non-Membre**.
- **Max Participants**. Si vous le laissez vide, les places sont illimitées.
- Les options **Événement public**, **Inscription Requise** et **Générer une Facture**.

## 4.3 Fiche détaillée

### Indicateurs
- **Inscrit** : nombre d'inscrits, hors annulations et liste d'attente.
- **Présent** : nombre de participants dont l'arrivée a été enregistrée.
- **Taux de Présence** : présents divisés par inscrits.
- **Revenus** : somme des paiements enregistrés ; pour les participants marqués comme Payé sans montant enregistré, c'est le montant dû qui compte, réduction déjà déduite.

### Participants
**Ajouter un Participant** propose deux **types de participant** :
- **Membre** : il est choisi dans la liste des membres.
- **Invité (Externe)** : on indique son nom et son email.

Le montant dû est le **Coût Membre** pour les membres et le **Coût Non-Membre** pour les invités. Le champ facultatif **Code promo** applique une réduction (voir 9.3) ; le tableau affiche le montant dû et, le cas échéant, le coupon utilisé et la réduction.

Pour chaque participant, le tableau affiche le statut, la présence et le paiement, avec l'action de retrait. Le champ **Rechercher un participant par nom ou e-mail** filtre les lignes : pratique à l'entrée avec de longues listes.

Sur chaque ligne :
- **Enregistrer l'arrivée** : marque le participant comme présent et enregistre son heure d'arrivée, affichée sous le bouton. Le bouton devient **Présent** ; appuyez de nouveau dessus pour annuler l'arrivée. Un participant dont l'inscription est annulée ne peut pas être enregistré.
- **Statut du paiement** : dans le menu de la ligne, choisissez En attente, Payé, Exonéré ou Remboursé. La modification est enregistrée immédiatement.

Après chaque action, les indicateurs du haut se mettent à jour.

### Certificats
Choisissez un modèle et appuyez sur **Émission groupée** : chaque participant inscrit en tant que membre reçoit une attestation. Les invités externes ne reçoivent pas d'attestation nominative.

### Importation CSV
Ici, vous importez les participants depuis un fichier CSV. Le déroulement (aperçu, puis confirmation) est le même que pour les activités : voir le chapitre 3.
