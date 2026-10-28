# 8. Gestion des Bénévoles

Ouvrez **Bénévoles** depuis le groupe **Personnes** du menu latéral. Vous y associez des membres au rôle de bénévole, enregistrez les quarts et gérez les remboursements de frais.

## 8.1 Liste des bénévoles

Pour chaque bénévole, le tableau affiche :
- le nom et l'email du membre ;
- les compétences ;
- les heures ;
- le statut.

**Rechercher des bénévoles...** filtre par nom. Les actions de chaque ligne sont **Voir les détails**, **Modifier** et **Supprimer**.

La colonne **Heures** additionne les **Heures Travaillées** de tous les quarts du bénévole ; **Statut** indique Actif ou Inactif.

## 8.2 Ajouter un bénévole

Appuyez sur **Ajouter un Bénévole** et remplissez :
- **Membre** (obligatoire) : choisissez le membre dans **Sélectionner un membre...** ;
- **Compétences** : texte libre, ex. Premiers secours, Logistique, Communication ;
- **Disponibilité** : texte libre, ex. Week-end, Soirées ;
- **Statut** : Actif ou Inactif ;
- **Notes**.

Appuyez sur **Créer** (ou **Mettre à jour** en modification).

> En modification, le membre associé ne change pas : pour associer un autre membre, créez un nouveau bénévole.

## 8.3 Fiche détaillée

L'en-tête affiche **Bénévole** avec son numéro et l'**ID Membre**, ainsi que le bouton **Modifier**. Trois encadrés indiquent **Statut**, **Compétences** et **Disponibilité**. En dessous se trouvent deux onglets.

### Quarts
Appuyez sur **Ajouter un Quart** et remplissez :
- **Heure de Début** et **Heure de Fin** (date et heure, obligatoires) ;
- **Rôle** ;
- **Événement (Facultatif)** ou **Activité (Facultatif)**, pour lier le quart ;
- **Heures Travaillées** et **Valeur Horaire (€)** ;
- **Statut** : Prévu, Terminé ou Manqué ;
- **Description / Notes**.

Appuyez sur **Enregistrer le Quart**. Le tableau affiche le début, la fin, le rôle, les heures et le statut ; l'icône de modification rouvre le quart.

> Les heures travaillées ne sont pas calculées à partir des horaires : saisissez-les vous-même. La valeur horaire est enregistrée mais n'est utilisée dans aucun récapitulatif. En modification, seuls les horaires, le rôle, les heures et le statut sont mis à jour ; l'événement, l'activité, la valeur horaire et les notes restent ceux d'origine. Les quarts ne peuvent pas être supprimés.

### Dépenses (remboursements de frais)
Appuyez sur **Ajouter une dépense** et indiquez **Date**, **Description** et **Montant (€)**, tous obligatoires, puis **Enregistrer la dépense**. La dépense est d'abord en attente d'approbation.

Les actions dépendent du statut de la dépense :
- en attente : **Approuver** ou **Rejeter** ;
- approuvée : **Marquer comme Payé**.

Lorsque vous marquez une dépense comme payée, AssociaGo enregistre automatiquement une dépense dans Finance, à la date du jour et avec la catégorie Reimbursement, au nom de l'association avec laquelle vous êtes connecté.

> Les dépenses ne peuvent être ni modifiées ni supprimées, et on ne peut pas y joindre de reçus.
