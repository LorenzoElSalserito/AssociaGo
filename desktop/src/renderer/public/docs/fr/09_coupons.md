# 9. Coupons et Réductions

Les coupons sont des codes de réduction pour les activités et les événements. Vous les gérez depuis trois endroits, qui affichent la même liste :
- l'entrée **Coupons** du groupe **Activités** du menu latéral ;
- l'onglet **Coupons** de la page **Activités et Coupons** ;
- l'onglet **Coupons** de la page **Événements et Coupons**.

## 9.1 Liste des coupons

Pour chaque coupon, le tableau affiche :
- **Code** ;
- **Réduction** : pourcentage ou montant en euros, avec le montant minimum s'il est défini ;
- **Validité** : date de début et de fin (∞ si sans échéance) ;
- **Utilisations** : inscriptions enregistrées avec le coupon sur le maximum autorisé (∞ si illimitées) ;
- **Statut** : **Actif** ou **Inactif**.

Les actions de chaque ligne sont **Modifier** et **Supprimer**.

## 9.2 Créer un coupon

Appuyez sur **Ajouter un Coupon** et remplissez :
- **Code Coupon** (obligatoire), ex. ETE2026.
- **Description**.
- **Type de Réduction** : Pourcentage ou Montant Fixe.
- **Valeur de la Réduction** (obligatoire).
- **Date de Début** (aujourd'hui par défaut) et **Date de Fin**.
- **Max. Utilisations (0 pour illimité)**.
- **Montant Minimum**.
- **Activités Applicables** et **Événements Applicables** : sélection multiple. Si vous choisissez au moins une activité ou un événement, le coupon n'est valable que pour ceux-ci ; laissez les deux listes vides pour qu'il soit valable partout.
- **Actif**.

Appuyez sur **Enregistrer le Coupon**.

## 9.3 Utilisation

Le code se saisit dans le champ **Code promo** du formulaire **Ajouter un Participant**, aussi bien pour les activités que pour les événements (membres et invités). Les majuscules ne comptent pas. Appuyez sur **Appliquer** pour voir le prix, la réduction et le **Montant dû** avant d'enregistrer.

Le prix de départ est :
- pour les activités, le coût de l'activité ;
- pour les événements, le coût membre pour les membres et le coût non-membre pour les invités.

La réduction en pourcentage est arrondie au centime ; la réduction fixe ne dépasse jamais le prix, le montant dû ne descend donc pas en dessous de zéro.

Le coupon est refusé, avec un message, si :
- le code n'existe pas dans l'association ;
- il n'est pas **Actif** ;
- aujourd'hui est avant la **Date de Début** ou après la **Date de Fin** (la date de fin est incluse) ;
- il a atteint **Max. Utilisations** (0 = illimité) ;
- le prix est inférieur au **Montant Minimum** ;
- il n'est pas valable pour l'activité ou l'événement choisi (voir 9.2).

À l'enregistrement, le programme vérifie de nouveau le coupon : s'il n'est plus valable entre-temps, l'inscription n'est pas enregistrée. S'il est valable, le coupon, la réduction et le montant dû restent associés au participant, et **Utilisations** augmente de 1. Le coupon apparaît comme étiquette dans le tableau des participants et les **Revenus** utilisent le montant réduit.

> Retirer un participant ne restitue **pas** l'utilisation : le compteur compte les coupons utilisés, y compris pour des inscriptions annulées ensuite. Si nécessaire, augmentez **Max. Utilisations** depuis le formulaire de modification.
