# 7. Gestion de l'Inventaire (Inventory)

La section **Inventaire** sert à suivre les biens matériels de l'association.

## 7.1 Liste des Articles
Liste tous les biens, avec quantité, valeur et état.

## 7.2 Ajouter un Article
Le formulaire permet de saisir :
- **Nom et Code Inventaire**.
- **Catégorie** : (Électronique, Mobilier, Sport, etc.).
- **Quantité et Valeur**.
- **État** : (Neuf, Bon, Cassé, Jeté).
- **Méthode d'Acquisition** : (Achat, Don, Prêt).
    - *Note* : Si "Achat" est sélectionné, le système propose de créer automatiquement la transaction de dépense.

## 7.3 Prêts (Loans)
Depuis la fiche d'un article, vous pouvez gérer les prêts aux membres :
- **Enregistrer un Prêt** : Sélectionnez le membre et la date.
- **Retour** : Marquez l'article comme retourné et mettez à jour la disponibilité.
- **Historique** : Visualisez tous les mouvements de l'article.
