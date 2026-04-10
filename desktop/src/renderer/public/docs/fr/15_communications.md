# 15. Communications

La section **Communications** permet d'envoyer des emails institutionnels aux membres, de gerer des modeles predefinis et de suivre l'etat de livraison.

## 15.1 Vue d'ensemble
La page est divisee en deux onglets :
- **Messages** : La liste des communications creees et envoyees.
- **Modeles** : Les templates reutilisables pour accelerer la creation des messages.

## 15.2 Gestion des Modeles

### Creer un Modele
1. Depuis l'onglet **Modeles**, cliquez sur **"Nouveau Modele"**.
2. Remplissez :
   - **Nom** : Nom identifiant (ex. "Convocation Assemblee Generale").
   - **Objet** : L'objet de l'email.
   - **Corps HTML** : Le texte du message.
   - **Corps Texte** : Version texte brut (pour les clients email ne supportant pas le HTML).
   - **Categorie** : Generale, Renouvellement, Evenement, Activite, Assemblee, Fiscale.
3. Utilisez les **champs de fusion** dans le texte :
   - `{{name}}` — Nom complet du destinataire.
   - `{{associationName}}` — Nom de l'association.
4. Cliquez sur **"Enregistrer"**.

### Appliquer un Modele
Lors de la creation d'un nouveau message, il est possible de selectionner un modele dans le menu deroulant. L'objet et le corps seront pre-remplis avec les donnees du template.

## 15.3 Creation et Envoi de Messages

### Creer un Message
1. Depuis l'onglet **Messages**, cliquez sur **"Nouveau Message"**.
2. Remplissez :
   - **Objet** : L'objet de l'email.
   - **Corps** : Le contenu du message.
   - **Filtre des destinataires** : Filtrez les membres par statut (ex. uniquement les Actifs).
3. Cliquez sur **"Enregistrer comme Brouillon"** ou procedez a l'envoi.

### Resoudre les Destinataires
Avant l'envoi, cliquez sur **"Resoudre les Destinataires"** pour :
- Visualiser la liste complete des membres qui recevront le message.
- Verifier les adresses email.
- Controler le nombre total de destinataires.

### Envoyer
1. Cliquez sur **"Envoyer"**.
2. Le systeme envoie les emails via le serveur SMTP configure dans les parametres.
3. L'etat passe de **Brouillon** a **En cours d'envoi** puis a **Envoye**.

## 15.4 Statistiques de Livraison
Pour chaque message envoye, la vue detaillee affiche :
- **Total des destinataires** : Nombre d'emails envoyes.
- **Delivres** : Emails distribues avec succes.
- **Echoues** : Emails non delivres (avec detail de l'erreur).
- **Date d'envoi** : Horodatage de l'envoi.

## 15.5 Etats des Messages
| Etat | Signification |
|------|---------------|
| Brouillon | Message enregistre mais pas encore envoye. |
| En cours d'envoi | Envoi en cours. |
| Envoye | Tous les messages ont ete traites. |
| Echoue | L'envoi a rencontre des erreurs. |

> **Note** : Pour utiliser les communications par email, il est necessaire de configurer un serveur SMTP dans les parametres de l'application (variables d'environnement SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD).
