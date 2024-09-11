# TODO

- [ ] make a readme explaining: 
    - [ ] how to setup the project



- [x] faire en bdd le champ status du cours (par defaut c'est draft)
- [x] pour le pdf image ... possibilite d'ajouter la source (obligatoire)
<!-- - [ ] Bien mettre les sources partout -->
- [ ] pour les chapitres: les faire recherchable: v1) sur titre v2) vectorielle
- [ ] Integration matomo
- [x] Revue decouverte -> pas telechargable
- [ ] http://localhost:3000/prof/parametres -> ajouter nom etablissmeent




# Processus de création et de validation d'un cours

1. Le professeur crée son cours.
2. Il télécharge des images / PDF depuis son ordinateur.
3. Lors du téléchargement, on lui propose de partager ce contenu avec la communauté.
4. Il finalise son cours et le publie.
5. Une équipe valide (ou non) le cours.
6. Si le cours est validé :
   - Les documents que le professeur a décidé de partager avec la communauté sont récupérés.
   - Ces documents sont indexés.

Donc pour chaque cours, on a un status : "draft" | "pending" | "published"