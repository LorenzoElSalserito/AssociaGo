# 2. Gestion des Membres

La section **Membres** contient le registre des personnes inscrites à l'association et leurs adhésions.

## 2.1 Liste des membres

Le tableau affiche le nom, l'email, le rôle, l'échéance et le statut de chaque membre.
- **Rechercher des membres...** filtre par prénom, nom ou email.
- Les actions de chaque ligne sont **Modifier**, **Renouveler l'adhésion** et **Supprimer**.
- Dans les associations de type **ASD**, le statut du certificat médical sportif apparaît aussi. En haut de la liste, un avertissement signale les certificats expirés et ceux qui expirent dans les 30 jours.

## 2.2 Nouveau membre et modification

Appuyez sur **Ajouter un Membre**, ou utilisez *Inscrire un Nouveau Membre* depuis le Tableau de bord ou « Nouveau membre » depuis la recherche de fonctions (<kbd>Ctrl</kbd>+<kbd>K</kbd>).

### Données personnelles
- **Prénom**, **Nom**, **Date de naissance** et **Sexe** sont obligatoires.
- **Code cadastral** est le code de la commune de naissance (ex. H501 pour Rome).
- **Code Fiscal** est obligatoire. Le bouton **Calculer** le déduit du prénom, du nom, de la date de naissance, du sexe et du code cadastral.
- Coordonnées : **Email**, **Téléphone**, **Adresse**, **Ville**, **Code postal**.

### Adhésion
- **Numéro de carte** : champ libre.
- **Date d’inscription (réception du paiement)** : obligatoire, elle ne peut pas être dans le futur. Elle vaut aussi comme date du paiement.
- **Type / Fonctions** : vous pouvez en cocher plusieurs (Membre ordinaire, Membre fondateur, Membre d’honneur, Président, Vice-président, Secrétaire, Trésorier, Administrateur).

### Cotisation
Uniquement pour un nouveau membre, **Enregistrer le paiement de la cotisation** crée aussi la recette dans Finance :
- montant proposé 20,00 €, modifiable ;
- méthode au choix entre Espèces, Virement Bancaire, TPE / Carte et PayPal.

En modification, la case n'est pas disponible : les paiements suivants s'enregistrent dans Finance. Le format de carte et la cotisation de base des Paramètres ne sont pas encore appliqués automatiquement dans ce formulaire.

### Certificat médical sportif (ASD uniquement)
La section **Certificat Médical Sportif** regroupe :
- le type (Compétitif ou Non Compétitif) ;
- la date de délivrance et d'expiration ;
- le médecin certificateur, l'établissement et les notes.

## 2.3 Renouvellement et suppression

- **Renouveler l'adhésion** demande confirmation et repousse l'échéance à **un an à partir d'aujourd'hui**. Le renouvellement n'enregistre aucun paiement : la cotisation doit être enregistrée dans Finance.
- **Supprimer** demande confirmation et retire l'adhésion du membre de cette association.

## 2.4 Import et export CSV/JSON

Appuyez sur **Importer CSV** pour ouvrir le panneau **Importer/exporter les membres**. Pour le fermer, utilisez **Masquer l'importation CSV**.

1. **Exemple CSV** / **Exemple JSON** téléchargent un fichier d'exemple avec les colonnes prévues.
2. **Exporter CSV** / **Exporter JSON** téléchargent tous les membres actuels.
3. Choisissez un fichier CSV ou JSON et appuyez sur **Générer l'aperçu**. Le récapitulatif indique les lignes totales, valides, en doublon et les erreurs.
4. **Confirmer l'importation** importe toutes les lignes valides en une seule opération.

Règles :
- si une ligne n'est pas valide, l'importation est bloquée et aucune donnée n'est écrite ;
- les membres déjà présents sont ignorés, sans écraser de données ;
- limite de 5000 lignes et 5 Mo par fichier ;
- dans l'export CSV, les cellules qui commencent par `=`, `+`, `-` ou `@` sont protégées, afin que les tableurs ne les exécutent pas comme des formules.

> La carte de membre imprimable n'est pas encore disponible depuis l'interface.
