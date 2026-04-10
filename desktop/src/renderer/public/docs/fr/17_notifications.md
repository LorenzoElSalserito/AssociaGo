# 17. Notifications

Le systeme de **Notifications** d'AssociaGo informe en temps reel des evenements importants de l'association.

## 17.1 Cloche des Notifications
Dans l'en-tete de la page, a cote du profil utilisateur, se trouve l'icone de la **cloche** :
- Un **badge rouge** avec le nombre indique les notifications non lues.
- En cliquant sur la cloche, le panneau des notifications s'ouvre.

## 17.2 Panneau des Notifications
Le panneau affiche la liste des notifications classees de la plus recente a la plus ancienne :

Pour chaque notification sont affiches :
- **Titre** : Description breve de l'evenement.
- **Message** : Detail supplementaire.
- **Date et Heure** : Quand la notification a ete generee.
- **Etat** : Lue (grisee) ou Non lue (mise en evidence).

### Actions Disponibles
- **Marquer comme lue** : Cliquez sur la notification pour la marquer comme lue.
- **Tout marquer comme lu** : Bouton en haut du panneau pour marquer toutes les notifications comme lues en une seule action.

## 17.3 Types de Notification
Le systeme genere des notifications automatiques pour differents evenements :

| Type | Description |
|------|-------------|
| **INFO** | Informations generales (ex. "Nouveau membre inscrit"). |
| **WARNING** | Avertissements necessitant une attention (ex. "Cartes d'adhesion arrivant a echeance"). |
| **ALERT** | Situations urgentes (ex. "Echeance fiscale imminente"). |
| **REMINDER** | Rappels programmes (ex. "Assemblee demain"). |

## 17.4 Mise a Jour Automatique
Les notifications sont mises a jour automatiquement toutes les **30 secondes** sans avoir besoin de recharger la page. Le badge sur la cloche se met a jour en temps reel.

## 17.5 Notifications Associees
Certaines notifications sont associees a des entites specifiques (membre, evenement, activite). Le systeme enregistre le type et l'ID de l'entite concernee pour faciliter la navigation directe vers le contexte de la notification.

> **Note** : Les notifications sont generees automatiquement par le systeme en reponse a des actions et des echeances. Il n'est actuellement pas possible de creer des notifications manuelles.
