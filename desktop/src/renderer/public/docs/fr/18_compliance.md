# 18. Conformite et Audit

La section **Audit** enregistre automatiquement toutes les operations sensibles effectuees sur la plateforme, garantissant la tracabilite complete exigee par la reglementation du secteur associatif.

## 18.1 Qu'est-ce que le Journal d'Audit
Le journal d'audit est un registre immuable qui documente :
- **Qui** a effectue l'operation (utilisateur).
- **Quoi** a ete fait (type d'action).
- **Quand** cela s'est produit (horodatage precis).
- **Sur quelle entite** l'action a ete effectuee (membre, transaction, evenement, etc.).
- **Quelles valeurs** ont change (avant/apres, lorsque disponible).

## 18.2 Operations Tracees
Le systeme enregistre automatiquement les operations les plus pertinentes, parmi lesquelles :
- Creation, modification et suppression de membres.
- Enregistrement et modification de transactions financieres.
- Creation et envoi de communications.
- Approbation de bilans.
- Emission d'attestations.
- Modifications des parametres de l'association.
- Gestion des presences.

## 18.3 Consultation du Journal

### Acces
Le journal d'audit est consultable via les API du systeme. Les informations disponibles comprennent :

### Filtres Disponibles
- **Par association** : Affiche uniquement les operations d'une association specifique.
- **Par entite** : Filtre par type d'entite (ex. "MEMBER", "TRANSACTION") et ID specifique.
- **Par date** : Selectionne un intervalle temporel avec dates de debut et de fin.
- **Par utilisateur** : Filtre les actions d'un utilisateur specifique.

### Pagination
Les resultats sont pagines pour gerer de grands volumes de donnees. Il est possible de specifier :
- **Page** : Numero de la page courante.
- **Taille** : Nombre d'enregistrements par page (par defaut 50).

## 18.4 Comptage des Operations
Un endpoint est disponible pour obtenir le nombre total d'operations enregistrees pour une association, utile pour les tableaux de bord et les statistiques.

## 18.5 Caracteristiques Techniques
- **Transaction independante** : Chaque entree d'audit est ecrite dans une transaction separee. Meme si l'operation principale echoue, la tentative est tout de meme enregistree dans le journal.
- **Immuabilite** : Les entrees d'audit ne peuvent etre ni modifiees ni supprimees.
- **Indexation** : Le journal est indexe par association, entite, utilisateur et date pour garantir des recherches rapides.

## 18.6 Importance pour le Secteur Associatif
La tracabilite des operations est une exigence fondamentale pour :
- **Revision legale** : Les organismes dont les recettes depassent certains seuils sont soumis a une revision.
- **Controles fiscaux** : L'administration fiscale peut demander une documentation detaillee.
- **Transparence** : Les membres ont le droit d'acceder aux documents de l'association.
- **Conformite GDPR** : Le journal documente qui a effectue des operations sur les donnees personnelles.

> **Note** : Le journal d'audit est une fonctionnalite interne de securite. L'acces au journal devrait etre limite aux administrateurs de l'association et aux commissaires aux comptes.
