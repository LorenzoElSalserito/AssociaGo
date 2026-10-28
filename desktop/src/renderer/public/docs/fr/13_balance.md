# 13. Bilan financier annuel

La page **Bilan Annuel** calcule le compte rendu financier d'une année à partir des mouvements enregistrés en comptabilité.

## 13.1 Liste des bilans

Le tableau affiche **Année**, **Titre**, **Statut** et **Résultat net** (vert s'il est positif, rouge s'il est négatif). Cliquez sur une ligne pour ouvrir le bilan. L'icône **corbeille** le supprime, après la confirmation **Êtes-vous sûr ?**.

## 13.2 Calculer un bilan

1. Appuyez sur **Calculer le bilan**.
2. Dans la fenêtre **Calculer le bilan annuel**, indiquez l'**Année**.
3. Appuyez sur **Calculer**.

Le système prend les mouvements du 1er janvier au 31 décembre, les regroupe par catégorie (ceux sans catégorie vont dans « Autres recettes » ou « Autres dépenses ») et crée le bilan « Bilan annuel ANNÉE ». Le titre et les libellés génériques sont rédigés dans la langue de l'interface au moment du calcul.

> S'il existe déjà un bilan pour cette année, il est recalculé et écrasé, même s'il était approuvé, et revient à un état non approuvé.

## 13.3 Détail

En haut, trois encadrés : **Revenus Totaux**, **Dépenses Totales** et **Résultat net**. En dessous, deux tableaux **Revenus** et **Dépenses** avec une ligne par catégorie et le total en gras (TOTAL DES RECETTES, TOTAL DES DÉPENSES).

> La comparaison avec l'année précédente est calculée mais n'est affichée ni sur la page ni dans le PDF.

## 13.4 Signataires

À l'ouverture, le système vérifie de lui-même que **Président**, **Secrétaire** et **Trésorier** ont un nom dans **Paramètres › Signatures** ou dans l'**Organigramme** (**Paramètres › Profil de l'Association**). S'il en manque un, l'avertissement **Signataires manquants** apparaît, suivi des rôles sous forme de code anglais (president, secretary, treasurer).

## 13.5 Approbation

**Approuver** fait passer le bilan à l'état approuvé. Le bouton reste désactivé tant qu'il manque ne serait-ce qu'un des trois signataires ; après l'approbation, il disparaît.

> L'approbation ne rend pas le bilan immuable : il peut encore être supprimé ou recalculé.

## 13.6 PDF

**Télécharger PDF** est disponible dans tous les états, même avant l'approbation, et enregistre le fichier `bilancio_ANNO.pdf` au format A4, dans la langue de l'interface (libellés, dates et montants). Il contient :
- le nom, l'adresse, la ville et le code fiscal de l'association ;
- le titre « BILAN ANNUEL ANNÉE » et la période ;
- les recettes et les dépenses par catégorie avec les totaux ;
- « EXCÉDENT » ou « DÉFICIT », le fonds initial et le fonds final ;
- une section « Signatures » pour le Président, le Secrétaire et le Trésorier : image de la signature de **Paramètres › Signatures** (chapitre 16), nom et fonction ; sans signature enregistrée, le nom de l'Organigramme et une ligne vide ;
- la date et l'heure de génération et le numéro de page.

> Le PDF ne contient ni logo ni date d'approbation.

À chaque téléchargement, une somme de contrôle SHA-256 du PDF est calculée. Ses 16 premiers caractères apparaissent à côté du statut après avoir quitté puis rouvert la page.

> **Remarque** : le bilan financier annuel est obligatoire pour les organismes du Tiers Secteur et doit être approuvé par l'assemblée dans les délais légaux (en général avant le 30 avril de l'année suivante).
