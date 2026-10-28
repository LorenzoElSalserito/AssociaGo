# 10. Paramètres et base de données

Les **Paramètres** s'ouvrent depuis la barre latérale ou depuis le menu de l'association, en haut à droite. Il y a sept onglets : **Profil de l'Association**, **Finance**, **Général**, **Registre**, **Signatures**, **Base de Données** et **Journal d'activité**.

## 10.1 Profil de l'Association

Pour modifier les données, appuyez sur **Modifier le Profil** puis, une fois terminé, sur **Enregistrer les Modifications**.
- **Identité** : Nom de l'Association, Type, Code Fiscal, Numéro de TVA, Date de fondation.
- **Contacts** : Email, Téléphone, Adresse, Ville, Province, Code postal.
- **Organigramme** : Président, Vice-Président, Secrétaire, Trésorier. Ces noms figurent sur les documents officiels : bilan financier annuel et signataires des attestations.
- **Documents** : Chemin/Lien statut et Chemin/Lien règlement.
- **Logo de l'Association** : appuyez sur **Télécharger Nouveau** et choisissez un PNG ou un JPG. 500×500 px est recommandé.
- **Configuration** : Format du Numéro de Membre (`YYYY` pour l'année, `####` pour le numéro progressif) et Cotisation de base.

> Le format de carte et la cotisation de base sont enregistrés, mais le formulaire de membre ne les applique pas encore automatiquement (voir chapitre 2).

## 10.2 Finance

Vous y gérez les **Méthodes de Paiement** avec **Ajouter une Méthode** :
- **Nom de la Méthode** ;
- **Type** : Espèces, Virement Bancaire, Paiement en Ligne, Autre ;
- **Actif**, c'est-à-dire si la méthode est disponible dans les transactions ;
- **Appliquer la Commission**, avec **Commission Fixe (€)** et/ou **Commission en Pourcentage (%)**.

Chaque méthode peut être modifiée ou supprimée.

## 10.3 Général

- **Langue** : italien, anglais, espagnol, allemand, français.
- **Thème** : Clair ou Sombre. Le choix s'applique après **Enregistrer les Préférences**. Le bouton soleil/lune de la barre supérieure change le thème instantanément.
- **Zoom de l’interface** : 50 %, 75 %, 100 %, 125 %, 150 %, 175 % ou 200 %. Il s'applique immédiatement et est mémorisé.
- **Gestion des Données** : **Sauvegarder Maintenant** (voir 10.6).
- **Infos App** : version, licence, avertissements, **Signaler un bug** (ouvre un email déjà rempli avec la version) et l'encadré **Soutenir AssociaGo** avec **Soutenir par un don**.

## 10.4 Registre, Signatures et Journal d'activité

- **Registre** : sites, documents et échéances de l'association (voir chapitre 18).
- **Signatures** : les signatures institutionnelles (voir chapitre 16).
- **Journal d'activité** : la liste des créations, modifications et suppressions de données, avec des filtres par domaine, action et dates (voir chapitre 18).

## 10.5 Base de données

AssociaGo peut fonctionner avec deux types de base de données :

| | **SQLite local** (par défaut) | **MariaDB distant** |
|---|---|---|
| Où sont les données | Dans un fichier sur l'ordinateur | Sur un serveur MariaDB de votre organisation |
| Usage typique | Un seul poste | Plusieurs postes sur les mêmes données |
| Configuration | Aucune | Hôte, port, base de données, utilisateur, mot de passe |

L'encadré du haut indique la base de données utilisée : **Actif : SQLite local** ou **Actif : MariaDB**.

### Connecter une base de données MariaDB
1. Demandez à l'administrateur une **base de données vide et dédiée** et un utilisateur ayant les droits de lecture, d'écriture et de création de tables.
2. Effectuez une sauvegarde (voir 10.6).
3. Activez **Utiliser une Base de Données Distante** et remplissez **Hôte**, **Port** (en général 3306), **Nom de la Base de Données**, **Nom d'utilisateur** et **Mot de passe**.
4. Si le serveur le prévoit, activez **Utiliser une Connexion SSL**. AssociaGo vérifie le certificat du serveur.
5. Appuyez sur **Tester la connexion**. AssociaGo ouvre la connexion et essaie d'écrire puis de relire une donnée temporaire. En cas de succès, « Connexion vérifiée : lecture et écriture réussies. » apparaît.
6. Appuyez sur **Enregistrer les Paramètres de la Base de Données**. L'enregistrement refait la vérification : si les identifiants sont erronés, la configuration n'est pas enregistrée.
7. **Fermez et rouvrez AssociaGo.** La nouvelle connexion ne s'active qu'à la réouverture.

À la première ouverture sur une base vide, AssociaGo crée les tables et affiche le formulaire de premier démarrage (chapitre 1) pour créer l'association sur le serveur.

### À savoir
- **Les données ne sont pas transférées.** SQLite local et MariaDB restent deux archives séparées. Pour transférer les membres de l'une à l'autre, utilisez l'export et l'import CSV/JSON (chapitre 2).
- Pour revenir à SQLite, désactivez **Utiliser une Base de Données Distante**, enregistrez et rouvrez l'application. Les données locales sont toujours là.
- Le mot de passe de la base n'est plus jamais affiché. Si vous laissez le champ vide et ne changez ni l'hôte, ni l'utilisateur, ni la base, le mot de passe enregistré reste valable.
- Les erreurs de connexion n'affichent ni adresses internes ni identifiants.

## 10.6 Sauvegarde

**Sauvegarder Maintenant** (Paramètres › Général) enregistre une copie de la base de données dans le dossier `backups` des données d'AssociaGo (`~/.associago/backups` par défaut). À la fin, le chemin du fichier s'affiche.

- **SQLite** : une copie cohérente de la base (`.db`), créée même pendant l'utilisation de l'application.
- **MariaDB** : un instantané au format JSON (`.json`) de toutes les tables.

La sauvegarde ne comprend que la base de données : les logos et les fichiers externes ne sont pas inclus.

> La restauration n'est pas automatique. Pour SQLite, application fermée, remplacez le fichier de la base par la copie. L'instantané JSON de MariaDB sert d'archive et ne s'importe pas depuis l'interface.
