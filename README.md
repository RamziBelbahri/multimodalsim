# multimodalsim-vis
# Application Web multi-plateforme (Windows, Linux, Mac)
# Étapes pour lancer sur sa machine:
### 1. 
## Télécharger le repo git:
## `git clone https://github.com/RTOpt/multimodalsim-vis.git`
### 2. Aller à la racine du dépot(multimodalsim-vis):
## `git submodule update --init`
### 3.Utiliser ses propres fichiers de données ou : 
## `git lfs install | git lfs fetch | git lfs checkout`
### 4. Lancer Docker:
## `docker compose up -d --build`
## Si docker prend en compte des images précédentes, supprimer les images existantes et réessayer ou :
## -`docker compose down` puis
## -`docker compose up`
### Pour lancer la simulation en temps réel : Le répertoire pour mettre les fichiers de simulations est: multimodalsim-vis/multimodalsim-vis/backend/communication/data
### Pour charger une simulation existante des simulations chargées sont présentes à: multimodalsim-vis/multimodalsim-vis/frontend/src/simulation_data_samples
