# 11. Attestations et Certificats

La section **Attestations** permet de creer des modeles personnalisables et d'emettre des certificats pour les membres, les participants aux activites et les participants aux evenements.

## 11.1 Vue d'ensemble

La page est divisee en deux onglets principaux :
- **Modeles** : Les templates a partir desquels les attestations sont generees.
- **Emis** : La liste de toutes les attestations deja generees, avec la possibilite de les telecharger en PDF.

## 11.2 Gestion des Modeles

### Creer un Nouveau Modele
Cliquez sur **"Nouveau Modele"** pour ouvrir la fenetre de creation. La fenetre est organisee en quatre sections :

#### General
- **Nom** : Le nom identifiant du modele (ex. "Attestation de Participation Cours de Base").
- **Type** : Selectionnez la typologie parmi :
  - *Participation* — pour ceux qui ont participe a une activite ou un evenement.
  - *Assiduite* — pour ceux qui ont complete un parcours avec une presence minimale.
  - *Formation* — pour les cours de formation avec certification.
  - *Inscription* — attestation d'appartenance a l'association.
  - *Personnalise* — format libre pour des besoins specifiques.
- **Actif** : Interrupteur pour activer/desactiver le modele. Seuls les modeles actifs peuvent etre utilises pour l'emission.

#### Corps
C'est ici que l'on redige le texte de l'attestation. Une ligne de **boutons pour les champs dynamiques** permet d'inserer des espaces reservees qui seront automatiquement remplaces par les donnees reelles :

| Champ | Description |
|-------|-------------|
| `{{firstName}}` | Prenom du membre |
| `{{lastName}}` | Nom de famille du membre |
| `{{fiscalCode}}` | Code fiscal |
| `{{associationName}}` | Nom de l'association |
| `{{date}}` | Date d'emission |
| `{{activityName}}` | Nom de l'activite associee |
| `{{activityCategory}}` | Categorie de l'activite |
| `{{eventName}}` | Nom de l'evenement associe |
| `{{eventType}}` | Type de l'evenement |

Cliquez sur un bouton pour inserer le champ a la position actuelle du curseur dans le texte.

#### Mise en page
- **Orientation** : Horizontale (paysage) ou Verticale (portrait).
- **Format de papier** : A4, A3 ou Letter.

#### Signataires
Selectionnez les fonctions institutionnelles qui doivent signer l'attestation :
- President
- Secretaire
- Tresorier

Les signatures seront positionnees en bas du certificat PDF genere, en recuperant automatiquement les images des signatures configurees dans la section Parametres > Signatures.

### Apercu en Temps Reel
Sur le cote droit de la fenetre, un **panneau d'apercu** montre a quoi ressemblera l'attestation. Les champs dynamiques sont remplaces par des donnees d'exemple (ex. "Jean Dupont") pour donner une idee du resultat final. L'apercu reflete egalement l'orientation et l'etat actif/inactif.

### Modifier un Modele
Cliquez sur l'icone **crayon** dans la ligne du modele pour ouvrir la fenetre avec toutes les donnees pre-remplies.

### Supprimer un Modele
Cliquez sur l'icone **corbeille**. Une confirmation sera demandee avant la suppression. Les modeles ayant des attestations deja emises ne peuvent pas etre supprimes.

## 11.3 Emission des Attestations

### Emission Individuelle
1. Cliquez sur **"Emettre Certificat"**.
2. Selectionnez le **modele** dans le menu deroulant.
3. Saisissez l'**ID du membre** destinataire.
4. Cliquez sur **"Emettre"**.

Le systeme genere une attestation avec un numero unique (format : CERT-ANNEE-NNNN) et l'associe au membre.

### Emission en Lot (Batch)
Pour emettre des attestations a tous les participants d'une activite ou d'un evenement :
1. Selectionnez le modele.
2. Dans la section inferieure, choisissez une **activite** ou un **evenement** dans le menu deroulant.
3. Cliquez sur **"Emission batch par Activite"** ou **"Emission batch par Evenement"**.

Tous les participants actifs recevront une attestation.

## 11.4 Telechargement PDF
Dans l'onglet **Emis**, chaque attestation dispose d'un bouton de **telechargement**. Le PDF genere comprend :
- Titre et corps de l'attestation avec les donnees renseignees.
- Numero unique du certificat.
- Date d'emission.
- Signatures institutionnelles.
- Somme de controle SHA-256 pour la verification d'authenticite.
