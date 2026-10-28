# 1. AssociaGo : introduction, accès et interface

**AssociaGo** est le logiciel de gestion de bureau pour associations (APS, ASD, ODV, ETS). Les données restent dans une base de données locale SQLite, ou dans une base de données MariaDB de votre organisation (voir chapitre 10).

Ce manuel décrit les fonctions telles qu'elles existent dans l'application. Lorsqu'une fonction n'est que partielle, c'est indiqué.

## 1.1 Premier démarrage et accès

### Premier démarrage : configurer l'association
S'il n'existe encore aucune association sur l'ordinateur, AssociaGo ouvre le formulaire **Configurer une Nouvelle Association**, divisé en deux sections :

1. **Informations de l’association** : *Nom de l'Association*, *Type* (APS, ASD, ODV, ETS, Autre) et *Code Fiscal*. Sous le champ apparaît le format attendu pour la langue choisie : pour l'italien, 11 chiffres.
2. **Accès administrateur** : *Email Administrateur* et *Mot de Passe Maître*, d'au moins 6 caractères. L'icône en forme d'œil affiche ou masque le mot de passe.

Cochez **Rester connecté** si vous voulez être connecté automatiquement aux prochains démarrages, puis appuyez sur **Initialiser la Base de Données**. Si un champ manque ou si le code fiscal ne respecte pas le format, un avertissement apparaît et rien n'est créé. À la fin, vous entrez directement dans l'application.

### Accès
Aux démarrages suivants, vous voyez **Sélectionner l'Association** avec les associations déjà utilisées sur cet ordinateur. Vous pouvez les sélectionner à la souris ou au clavier (Tab, puis Entrée).

- Choisissez l'association, saisissez le mot de passe et appuyez sur **Connexion**.
- **Rester connecté** enregistre l'accès : au démarrage suivant, vous entrez sans mot de passe.
- **Ajouter une autre association** rouvre le formulaire de configuration.
- L'icône de corbeille retire l'association de la liste de cet ordinateur, après confirmation. Les données de la base ne sont pas supprimées.
- En haut à droite se trouve le sélecteur de langue : IT, EN, ES, DE, FR.

Au démarrage, AssociaGo vérifie les associations de la liste et retire celles qui n'existent plus dans la base de données utilisée, par exemple après le passage à une autre base.

### Récupération du mot de passe
Appuyez sur **Mot de passe oublié ?** dans l'écran du mot de passe. La procédure s'ouvre aussi d'elle-même après deux mots de passe erronés.

1. **Ces associations sont-elles les vôtres ?** Choisissez l'association et confirmez avec **OUI**.
2. Saisissez le **code fiscal de l’association**, puis deux fois le nouveau mot de passe (au moins 6 caractères).
3. **Réinitialiser le mot de passe** enregistre le nouveau mot de passe et vous connecte immédiatement.

> La récupération repose sur le code fiscal enregistré. Toute personne ayant accès à l'ordinateur et connaissant le code fiscal peut réinitialiser le mot de passe : protégez le compte du système d'exploitation.

## 1.2 Interface

### Navigation
La barre latérale regroupe les sections en *Vue générale*, *Personnes*, *Activités*, *Administration*, *Gouvernance* et *Assistance*. Le bouton en bas la réduit, en ne laissant que les icônes, puis la déploie à nouveau. Toujours en bas se trouve la version de l'application. Au clavier, appuyez sur Tab à l'ouverture pour activer **Aller au contenu**.

### Recherche de fonctions (palette de commandes)
Appuyez sur **Rechercher une fonction** dans la barre supérieure ou sur <kbd>Ctrl</kbd>+<kbd>K</kbd> (<kbd>⌘</kbd>+<kbd>K</kbd> sur macOS). Tapez le nom d'une section, ou « Nouveau membre » pour ouvrir directement le formulaire d'inscription. Utilisez les flèches pour vous déplacer, Entrée pour ouvrir et Échap pour fermer.

### Thème clair et sombre
Le bouton soleil/lune de la barre supérieure change le thème et le mémorise. Vous pouvez aussi le choisir dans **Paramètres › Général** : là, le choix doit être confirmé avec **Enregistrer les Préférences**.

### Menu de l'association
Le cercle avec les initiales, en haut à droite, affiche le nom et l'email de l'association. Il contient :
- **Paramètres** ;
- **Infos App** : version, licence AGPLv3, avertissements et le bouton **Soutenir par un don** ;
- **Déconnexion**, qui ferme la session. Si vous aviez choisi *Rester connecté*, cette connexion automatique est supprimée.

### Connexion avec le moteur de données
AssociaGo utilise un moteur local qui démarre avec l'application.
- Si le moteur ne répond pas au démarrage, un écran avec **Réessayer** apparaît.
- Si la connexion s'interrompt pendant le travail, l'avertissement « Serveur indisponible » apparaît avec **Réessayer**. Les lectures sont répétées, les enregistrements non : avant de répéter un enregistrement, vérifiez s'il avait déjà abouti.

## 1.3 Tableau de bord

Le **Tableau de bord** est la première page après la connexion.

### Indicateurs principaux
Trois cartes, chacune avec un lien vers sa section :
1. **Membres Actifs** : nombre de membres au statut *actif* et nombre de nouveaux membres du mois en cours. Le statut est celui enregistré sur l'adhésion : la date d'échéance n'est pas revérifiée automatiquement.
2. **Solde de Trésorerie** : recettes moins dépenses enregistrées dans Finance, avec le total des recettes (vert) et des dépenses (rouge) du mois en cours.
3. **Événements à Venir** : événements futurs non annulés, avec le nom et la date du prochain.

### Activités récentes
Affiche les 5 dernières opérations : nouveaux membres, paiements, événements. **Voir Tout** en affiche jusqu'à 20. La flèche à côté de chaque ligne ouvre la section correspondante.

### Actions rapides
- **Inscrire un Nouveau Membre** ouvre le formulaire d'inscription.
- **Créer un Événement** ouvre le formulaire de nouvel événement.
- **Enregistrer un Paiement** mène à Finance.

Si les données ne se chargent pas, un message avec **Réessayer** apparaît.

### Manuel
Ce manuel s'ouvre depuis l'entrée **Manuel de l'Utilisateur** de la barre latérale et suit la langue de l'interface.
