# 11. Attestations et Certificats

La page **Attestations** comporte deux onglets : **Modèles** et **Émis**. En haut se trouvent les boutons **Nouveau modèle** et **Émettre un certificat**.

## 11.1 Modèles

Pour chaque modèle, le tableau affiche le nom, le type, la mise en page (orientation / format) et le statut **Actif** ou **Inactif**. Les actions sont l'icône **crayon** (modifier) et l'icône **corbeille** (supprimer, après la confirmation **Êtes-vous sûr ?**).

> Si le modèle a déjà servi à émettre des attestations, la suppression échoue et un message d'erreur de la base de données apparaît. Il n'y a pas d'avertissement dédié.

## 11.2 Créer un modèle

Appuyez sur **Nouveau modèle**. À gauche se trouvent quatre onglets, à droite l'**Aperçu**.

### Général
- **Nom** (obligatoire : sans nom, **Créer** reste désactivé). Il devient aussi le titre de l'attestation.
- **Type** : Participation, Assiduité, Formation, Adhésion ou Personnalisé.
- **Actif** : interrupteur.

> Le statut **Actif** est purement informatif : les modèles inactifs apparaissent aussi lors de l'émission et peuvent être utilisés.

### Corps
Rédigez le texte dans **Corps du modèle**. Les boutons au-dessus du champ insèrent un champ dynamique à la position du curseur :

| Champ | Est remplacé par |
|-------|----------------------|
| `{{firstName}}`, `{{lastName}}` | prénom et nom du destinataire |
| `{{fiscalCode}}` | code fiscal du destinataire |
| `{{associationName}}` | nom de l'association |
| `{{date}}` | date d'émission |
| `{{activityName}}`, `{{activityCategory}}` | nom et catégorie de l'activité (émission par activité uniquement) |
| `{{eventName}}`, `{{eventType}}` | nom et type de l'événement, sous forme de code interne (émission par événement uniquement) |

Les champs d'activité et d'événement restent en texte littéral si l'attestation n'est pas émise depuis une activité ou un événement. Dans le PDF, le corps devient du texte brut : les éventuelles balises HTML sont supprimées.

### Mise en page
- **Orientation** : **Paysage** ou **Portrait**.
- **Format de papier** : A4, A3 ou Letter.

> Le format de papier est enregistré mais pas utilisé : le PDF est toujours en A4, dans l'orientation choisie.

### Signataires
Cochez les **Rôles des signataires** : Président (présélectionné), Secrétaire, Trésorier. Dans le PDF, chaque rôle a un bloc de signature avec l'image, le nom et la fonction repris de **Paramètres › Signatures** (chapitre 16) ; si aucune signature n'est enregistrée pour un rôle, le nom de l'**Organigramme** (**Paramètres › Profil de l'Association**) apparaît au-dessus d'une ligne vide.

### Aperçu
Affiche le titre, le corps avec des données d'exemple (ex. « Mario Rossi ») et une ligne de signature pour chaque rôle coché. Il suit l'orientation choisie.

Appuyez sur **Créer** (ou **Enregistrer** en modification).

## 11.3 Émettre des attestations

Appuyez sur **Émettre un certificat** et choisissez le **Modèle**.

### À un membre
1. Dans **Membre**, choisissez un nom dans la liste des membres de l'association.
2. Appuyez sur **Émettre**.

### À tous les participants
Sous **Ou émettre en lot pour tous les participants :**
- choisissez une **Activité** et appuyez sur **Émission groupée par activité** : les participants actifs inscrits en tant que membres reçoivent l'attestation ;
- ou choisissez un **Événement** et appuyez sur **Émission groupée par événement** : les participants enregistrés en tant que membres reçoivent l'attestation ; les invités sont ignorés.

Les boutons n'apparaissent qu'après avoir choisi le modèle et l'activité ou l'événement. Vous pouvez aussi émettre en lot depuis l'onglet **Certificats** d'une activité (chapitre 3).

> Il n'y a aucun contrôle des doublons : si vous répétez l'émission, chaque destinataire reçoit une nouvelle attestation.

Chaque attestation reçoit un numéro progressif au format **CERT-ANNÉE-NNNN**. Le texte et le titre sont figés au moment de l'émission : modifier le modèle ensuite ne change pas les attestations déjà émises. Les signatures, en revanche, sont lues à chaque téléchargement, selon les rôles du modèle.

## 11.4 Attestations émises et PDF

L'onglet **Émis** (avec le compteur) liste **Certificat** (numéro), **Destinataire** (nom du membre) et **Émis le**. L'icône de **téléchargement** télécharge le PDF (A4, avec le numéro et la date dans la langue de l'interface), qui contient :
- le titre (nom du modèle), le numéro et la date d'émission ;
- le corps avec les données remplies ;
- un bloc de signature pour chaque rôle signataire (image, nom et fonction) ;
- un code QR en bas à droite avec le numéro, l'association et la date.

> À chaque téléchargement, une somme de contrôle SHA-256 du PDF est calculée et enregistrée, mais elle n'est ni imprimée sur le document ni affichée dans l'interface.
