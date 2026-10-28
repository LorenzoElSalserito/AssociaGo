# 7. Gestion de l’Inventaire

Ouvrez **Inventaire** depuis le groupe **Activités** du menu latéral. Vous y enregistrez les biens et les équipements de l'association ainsi que les prêts aux membres.

## 7.1 Liste des articles

Pour chaque article, le tableau affiche :
- le nom et le code inventaire ;
- la catégorie ;
- la quantité ;
- le statut.

**Rechercher des articles...** filtre par nom. Cliquez sur une ligne ou sur **Voir les détails** pour ouvrir la fiche ; les autres actions sont **Modifier** et **Supprimer**.

## 7.2 Ajouter un article

Appuyez sur **Ajouter un Article** et remplissez :
- **Nom de l'Article** (obligatoire) et **Code inventaire** (ex. INV-001).
- **Description**.
- **Catégorie** : texte libre, vous choisissez vos catégories.
- **Quantité** et **Lieu**.
- **Méthode d'Acquisition** : Achat, Don, Prêt ou Inconnu.
- **Assigné à (ID utilisateur)** : facultatif, on saisit le numéro d'identification, pas le nom.
- **Valeur actuelle** et **Années d'amortissement**, facultatifs.
- **État** : Neuf, Bon, Moyen, Mauvais ou Cassé.
- **Statut** : Disponible, En Utilisation, Prêté, Perdu ou Jeté.
- **Notes**.

L'état et le statut sont indépendants : le premier décrit l'état physique, le second l'emplacement ou l'utilisation de l'article.

### Achat
Avec **Achat** apparaissent **Prix d'achat** et **Date d'Achat**. À la création, si le prix est supérieur à zéro, AssociaGo enregistre automatiquement une dépense dans Finance avec ce montant et la date d'achat (ou la date du jour).

> La dépense n'est créée que lorsque vous ajoutez l'article : si vous modifiez ensuite le prix, la transaction n'est pas mise à jour.

### Valeur et amortissement
La valeur actuelle est recalculée à partir du prix d'achat : si le prix, la date d'achat et les années d'amortissement sont renseignés, une quote-part fixe est déduite pour chaque année écoulée jusqu'à atteindre zéro ; sinon, elle correspond au prix d'achat.

> La valeur saisie à la main dans **Valeur actuelle** n'est pas conservée : au moment de la lecture, elle est remplacée par la valeur calculée.

Appuyez sur **Créer** (ou **Mettre à jour** en modification).

## 7.3 Fiche détaillée

En haut, vous trouvez le bouton **Modifier** et trois indicateurs : **Quantité**, **État** et **Statut**. Sous le nom apparaissent la catégorie et le lieu.

### Historique des prêts
Appuyez sur **Enregistrer le Prêt** et indiquez :
- **Sélectionner un Membre** (obligatoire) ;
- **Date de Prêt** et **Date de Retour Prévue** ;
- **Condition au prêt** : Neuf, Bon, Moyen, Mauvais ou Cassé ;
- **Notes**.

Le tableau affiche l'**ID Membre**, la **Date de Prêt**, la **Date de Retour** (ou la date prévue suivie de « (Exp) » tant que l'article n'est pas revenu) et le statut. Pour les prêts en cours, appuyez sur **Restituer** et confirmez : la date du jour est enregistrée.

> Enregistrer ou clôturer un prêt ne modifie ni le statut ni la quantité de l'article : mettez-les à jour à la main avec **Modifier**. L'état au retour n'est pas enregistré.
