# 18. Conformité et audit

Les outils de conformité disponibles aujourd'hui se trouvent dans l'onglet **Paramètres › Registre** : sites, documents institutionnels et échéances de l'association.

**Journal d'activité.** AssociaGo enregistre automatiquement chaque **création**, **modification** et **suppression** des données principales : membres et adhésions, mouvements et factures, activités, événements et participants, assemblées et motions, inventaire et prêts, bénévoles, créneaux et remboursements, coupons, budgets prévisionnels, bilans, attestations, communications, profil de l'association, signatures et paramètres de la base de données.

Pour le consulter, ouvrez **Paramètres › Journal d'activité**. Le tableau, de l'entrée la plus récente à la plus ancienne, affiche :
- **Date et heure** de l'opération ;
- **Domaine** (par exemple Membres, Finances, Événements) ;
- **Action** : Création, Modification ou Suppression ;
- **Enregistrement** : le type de donnée et son numéro d'identification ;
- **Détail** : pour les modifications, les noms des champs modifiés.

Vous pouvez filtrer par **Domaine**, **Action** et intervalle de dates (**Du**, **Au**) ; **Effacer les filtres** revient à la liste complète. Les entrées sont réparties en pages de 25.

Ce qui n'est **pas** enregistré :
- les valeurs des champs, ni avant ni après la modification : seulement leurs noms ;
- les mots de passe, codes d'accès, identifiants de la base de données, images des logos et des signatures ;
- l'auteur de l'opération : l'accès se fait par association, pas par utilisateur.

> Chaque association ne voit que son propre journal. Le journal ne se modifie pas depuis l'application et il est supprimé avec l'association.

## 18.1 Sites

Remplissez la ligne du haut et appuyez sur **Ajouter** :
- type : **Siège social**, **Siège opérationnel** ou **Siège projet** ;
- **Nom**, **Adresse**, **Ville** et province (**Prov.**).

Le tableau affiche **Type**, **Nom**, **Adresse** et **Contacts**. La corbeille supprime le site.

> La colonne **Contacts** reste vide : le formulaire n'a pas de champs pour le téléphone et l'email du site.

## 18.2 Documents

Pour archiver les statuts, les règlements et les autres actes :
1. choisissez le type : **Statut**, **Règlement** ou **Pièce jointe** ;
2. saisissez un **Titre** ;
3. sélectionnez le fichier et appuyez sur **Télécharger**.

Le fichier est copié dans le dossier de données d'AssociaGo. Le tableau affiche **Type**, **Titre** et, dans la colonne **Fichier**, le chemin où il est enregistré. La corbeille supprime à la fois la ligne et le fichier copié.

> Le document ne peut être ni ouvert ni téléchargé depuis l'application : pour le consulter, ouvrez le fichier à partir du chemin indiqué.

## 18.3 Échéances

Pour noter des obligations comme les renouvellements d'assurance, les déclarations ou les assemblées obligatoires :
- **Titre** et date d'échéance ;
- catégorie : **Fiscal**, **Juridique**, **Gouvernance**, **Assurances** ou **Autre** ;
- un champ numérique, prérempli à 30 : les jours de préavis.

Appuyez sur **Ajouter**. Le tableau affiche **Titre**, **Date d'échéance**, **Catégorie** et **Statut**. Une fois l'obligation remplie, appuyez sur **Marquer comme terminée** : l'échéance passe à terminée et le bouton disparaît. La corbeille la supprime.

> Les échéances sont un aide-mémoire à consulter manuellement. Les jours de préavis sont enregistrés, mais l'application n'envoie ni avertissements ni notifications, ne signale pas les échéances dépassées et ne recrée pas celles qui sont récurrentes.

> Les suppressions dans cet onglet (sites, documents, échéances) sont immédiates et ne demandent pas de confirmation.
