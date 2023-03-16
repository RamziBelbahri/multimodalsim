# Comment avoir la dernière version du simulateur sur sa branche et lancer le script du simulateur:
# Dans le dossier backend/multimodalsim:
# 1. git submodule update --init
# 2. git pull --recurse-submodules
# 3. Une fois que le repo est à jour, activer le venv (venv/Scripts/activate sur Windows) et rester dedans
# 4. python -m setup install pour updater les dépendances du nouveau repo
# 5. Optionnel (installer activemq): pip install stomp.py si nécessaire
# 6. Optionnel (lancer activemq):  docker run -it --ulimit nofile=122880:122880 -m 3G -p 61616:61616 -p 61614:61614 -p 61613:61613 -p 8161:8161 rmohr/activemq
# 7. Finalement, aller dans backend/communication et lancer la commande: python fixed_line_gtfs.py
