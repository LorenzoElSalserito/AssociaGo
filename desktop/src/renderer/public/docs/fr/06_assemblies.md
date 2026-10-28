# 6. Gestion des Assemblées

Ouvrez **Assemblées** depuis le groupe **Gouvernance** du menu latéral. Vous y enregistrez les assemblées des membres, les présences, les motions et vous téléchargez le procès-verbal.

## 6.1 Liste des assemblées

Pour chaque assemblée, le tableau affiche :
- le titre et le type ;
- la date et l'heure ;
- le quorum de première convocation (en pourcentage) ;
- le statut.

**Rechercher des assemblées...** filtre par titre. Cliquez sur une ligne ou sur **Voir les détails** pour ouvrir la fiche ; les autres actions sont **Modifier** et **Supprimer**.

## 6.2 Créer une assemblée

Appuyez sur **Nouvelle Assemblée** et remplissez :
- **Titre** (obligatoire) et **Description**.
- **Date** (obligatoire, avec l'heure), **Heure de Début** et **Heure de Fin**.
- **Lieu**.
- **Type** : Ordinaire ou Extraordinaire.
- **Statut** : Brouillon, Convoquée, En cours, Clôturée ou Annulée. Le statut se change à la main, en modifiant l'assemblée.
- **Président** et **Secrétaire** : texte libre, non lié à la liste des membres.
- **Quorum première convocation (%)** et **Quorum deuxième convocation (%)** : valeurs par défaut 50 et 33.
- **Notes**.

Appuyez sur **Créer** (ou **Mettre à jour** en modification).

## 6.3 Fiche détaillée

En haut, vous trouvez les boutons **Procès-verbal** et **Modifier** et quatre indicateurs :
- **Statut** ;
- **Présent** : participants enregistrés comme présents ;
- **Procuration** : participants enregistrés par procuration ;
- **Quorum** : **Atteint** ou **Non Atteint**.

Le quorum se calcule en additionnant les présents et les procurations et en comparant le total au nombre de membres actifs. Il est atteint si le pourcentage arrive au seuil de première convocation ou à celui de deuxième : en pratique, le seuil le plus bas suffit.

En dessous se trouvent trois onglets.

### Participants
Appuyez sur **Enregistrer la Présence** et indiquez :
- **Sélectionner un Membre** (obligatoire) ;
- **Type de Participation** : Présent, Procuration ou Absent ;
- **Rôle** : Membre, Président, Secrétaire ou Scrutateur ;
- **Mandataire** : n'apparaît qu'avec le type Procuration ; choisissez le membre qui reçoit la procuration ;
- **Notes**.

L'heure d'enregistrement est sauvegardée automatiquement. Le tableau affiche le nom du membre, le type de participation, le rôle et le mandataire. **Modifier** (icône crayon) permet de changer le membre, le type, le rôle, le mandataire et les notes ; **Supprimer** retire l'enregistrement.

> Les présents et les procurations déterminent le quorum et le nombre maximal de voix enregistrables pour chaque motion : mettez les présences à jour avant d'enregistrer les votes.

### Motions
Appuyez sur **Ajouter une Motion** et remplissez :
- **Titre** (obligatoire) et **Description** ;
- **Type de vote** : Majorité Simple, Majorité Qualifiée, Unanimité ou Consultatif ;
- **Numéro d'Ordre** ;
- **Prévu (à l'ordre du jour)** ;
- **Notes**.

Appuyez sur **Enregistrer la Motion**. Le tableau, trié par numéro d'ordre, affiche le type de vote, les voix et le **Résultat**. Les actions sont **Enregistrer le vote**, **Modifier** (tous les champs de la motion) et **Supprimer**.

**Enregistrer le vote** ouvre une fenêtre avec **Pour**, **Contre** et **Abstentions**. Pendant la saisie, vous voyez les votes exprimés par rapport aux votants (présents + procurations) et le résultat calculé. Les nombres doivent être des entiers positifs ou nuls et le total ne peut pas dépasser les présents plus les procurations ; sans présents ni procurations, le vote n'est pas enregistré. Appuyez sur **Enregistrer** ; **Effacer le vote** remet la motion à **En attente**.

Le résultat est calculé par le programme selon le type de vote :
- **Majorité Simple** : adoptée si les voix pour dépassent les voix contre (en cas d'égalité, elle est rejetée) ;
- **Majorité Qualifiée** : adoptée avec au moins 2/3 de voix pour sur les votes exprimés, abstentions comprises ;
- **Unanimité** : adoptée si personne ne vote contre et s'il y a au moins une voix pour ;
- **Consultatif** : aucun résultat contraignant, la motion est classée **Prise d'acte**.

Si vous modifiez le type de vote d'une motion déjà votée, le résultat est recalculé avec les voix enregistrées.

### Documents
Appuyez sur **Ajouter un Document** et indiquez **Nom du Document** (obligatoire), **Type de document** (Procès-verbal, Avis de convocation, Pièce jointe, Budget), **Description** et **Document Obligatoire**.

> Le champ **Fichier** est désactivé : le chargement de fichiers n'est pas encore disponible, seul le nom du document est donc enregistré.

## 6.4 Procès-verbal

**Procès-verbal** télécharge un PDF A4, dans la langue de l'interface, avec :
- le titre, le type, la date, le lieu, le président et le secrétaire de l'assemblée ;
- le quorum de première et de deuxième convocation et s'il a été atteint ;
- les noms des présents et des participants par procuration, avec le mandataire ;
- pour chaque motion, dans l'ordre : le type de vote, les voix pour, contre et les abstentions, le résultat (Adoptée, Rejetée, Prise d'acte ou En attente) et l'éventuelle décision ;
- les signatures du président et du secrétaire.

Les motions longues continuent sur les pages suivantes. Pour les signatures, ce qui est décrit au chapitre 16 s'applique : l'image de **Paramètres › Signatures** n'apparaît que si le nom indiqué dans l'assemblée coïncide avec celui de la signature enregistrée ; sinon, la ligne reste vide pour signer à la main.
