# 15. Communications

La page **Communications** (barre latérale, groupe **Gouvernance**) sert à préparer et envoyer des emails aux membres. Elle comporte deux onglets : **Messages** et **Modèles** ; à côté de chacun, un compteur indique le nombre d'éléments qu'il contient.

## 15.1 Modèles

Dans l'onglet **Modèles**, appuyez sur **Nouveau modèle** et remplissez :
- **Nom** (obligatoire, sans lui le bouton **Créer** reste désactivé) ;
- **Objet** ;
- **Corps (HTML)** : le texte du message. Vous pouvez utiliser les espaces réservés `{{name}}` (prénom et nom du destinataire) et `{{associationName}}` (nom de l'association).

Le tableau affiche **Nom du modèle** et **Objet**. Les actions de chaque ligne sont la modification (crayon, puis **Enregistrer**) et la suppression (corbeille, avec confirmation).

## 15.2 Créer un message

Dans l'onglet **Messages**, appuyez sur **Nouveau Message**.
- **Appliquer le modèle** : n'apparaît que s'il existe au moins un modèle et seulement pour les nouveaux messages. Copie l'objet et le corps du modèle dans le message.
- **Objet** (obligatoire).
- **Nom de l'expéditeur** et **Email de l'expéditeur**. L'email devient l'expéditeur du message ; si vous le laissez vide, `noreply@associago.local` est utilisé. Le nom de l'expéditeur est enregistré mais n'apparaît pas dans l'email.
- **Filtre de segment** : champ de texte libre. S'il contient le mot `active`, le message ne part qu'aux membres dont l'adhésion est active ; tout autre texte, ou un champ vide, signifie tous les membres de l'association ayant une adresse email.
- **Corps du message (HTML)**, avec les mêmes espaces réservés que les modèles.

Appuyez sur **Créer**. Le message est créé à l'état **Brouillon**.

Le tableau des messages affiche **Objet**, **Statut**, le nombre de **Destinataires** et la **Date** de création. Seuls les brouillons peuvent être modifiés (crayon) ; la corbeille supprime le message après confirmation.

## 15.3 Destinataires et envoi

Cliquez sur un message pour en ouvrir le détail. Pour un brouillon :
1. appuyez sur **Résoudre les destinataires** : l'application calcule la liste à partir des membres de l'association, selon le Filtre de segment, et affiche le nombre de destinataires trouvés. Chaque adresse email n'apparaît qu'une fois ; si vous appuyez à nouveau, la liste est recalculée depuis le début ;
2. appuyez sur **Envoyer** (actif seulement après avoir résolu les destinataires) et confirmez.

L'email part en texte brut : le contenu rédigé dans l'éditeur est converti en conservant les paragraphes et les retours à la ligne, sans mise en forme. Avant une communication importante, faites un envoi d'essai vers l'une de vos adresses.

## 15.4 Détail et statistiques

En haut, quatre encadrés : **Destinataires totaux**, **Livrés**, **Échecs** et **Envoyé le**. En dessous se trouvent le **Contenu du message** et le tableau **Destinataires** avec le nom, l'email, le statut (En attente, Envoyé ou Échoué) et l'heure d'envoi.

« Livrés » signifie que le serveur de messagerie a accepté l'email, pas qu'il est arrivé dans la boîte du membre.

Une fois l'envoi terminé, le message passe à **Envoyé** ; si aucun email n'a été accepté par le serveur, il passe à **Échoué**. En cas d'envois partiels, vérifiez l'encadré **Échecs** et la colonne statut des destinataires.

## 15.5 Configurer le serveur de messagerie

L'application n'a pas d'écran pour le serveur email : il doit être configuré par l'administrateur en définissant ces variables d'environnement avant de lancer AssociaGo.

| Variable | À quoi elle sert | Valeur si absente |
|---|---|---|
| `SMTP_HOST` | adresse du serveur de courrier sortant | `localhost` |
| `SMTP_PORT` | port du serveur (généralement 587 ou 25) | `25` |
| `SMTP_USER` | nom d'utilisateur de la boîte | vide |
| `SMTP_PASSWORD` | mot de passe de la boîte | vide |
| `SMTP_AUTH` | `true` si le serveur demande un utilisateur et un mot de passe | `false` |
| `SMTP_TLS` | `true` pour utiliser la connexion chiffrée STARTTLS | `false` |

Sans ces paramètres, l'application cherche un serveur de messagerie sur l'ordinateur lui-même : il n'y en a presque jamais, donc tous les emails finissent parmi les **Échecs**.
