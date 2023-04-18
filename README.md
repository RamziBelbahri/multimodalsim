# multimodalsim-vis
# Étapes pour lancer sur sa machine:
# L'application peut aussi bien rouleur sur windows que sur linux.
### 1. Télécharger Docker desktop si vous ne l'avez pas déjà. Lien: https://www.docker.com/products/docker-desktop/
### 2. Ouvrir Docker desktop (sinon vous ne réussirez pas à lancer l'application avec une commande docker).
## Dans un terminal: 
### 3. `git clone https://github.com/RTOpt/multimodalsim-vis.git`
### 4. Aller à la racine du dépot(multimodalsim-vis):
### 5. `git submodule update --init`
### 6. Facultatif: Utiliser ses propres fichiers de données ou : git lfs install | git lfs fetch | git lfs checkout
### 7. `docker compose up -d --build`
### Pour lancer la simulation en temps réel : Lancer la simulation en cochant OSRM (le dossier d'input est multimodalsim-vis/backend/communication/data/20191101)
### Pour charger une simulation le dossier d'input est multimodalsim-vis/frontend/src/simulation_data_samples/new_output.zip
