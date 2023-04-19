# Documentation pour les developpeurs du client:

## Components et services

```shell
|__multimodalsim-vis
|    |_frontend
|    |  |__src
|    |  |   |__app
|    |  |   |   |__components
|    |  |   |   |   |__debug-receiver       # Correspond à la fenêtre qui s'ouvre lorsqu'on clique sur le bouton
|    |  |   |   |   |                       # l'application. Cette fenêtre affiche les logs issus de la simulation temps réel
|    |  |   |   |   |
|    |  |   |   |   |
|    |  |   |   |   |__launch-modal         # Menu ouvert en cliquant sur le bouton "charger simulation"
|    |  |   |   |   |                       # Contient tous les boutons nécessaires pour lancer une simulation à partir d'un zip
|    |  |   |   |   |                       # Le zip doit provenir de l'appareil.
|    |  |   |   |   |
|    |  |   |   |   |
|    |  |   |   |   |__map
|    |  |   |   |   |   |__cesium-container # Conteur de la carte Césium est des outils associés
|    |  |   |   |   |                       # Contient l'instance initiale du viewer de Césium et le partage au reste de l'application
|    |  |   |   |   |
|    |  |   |   |   |
|    |  |   |   |   |__save-modal           # Menu pour la sauvegarde des simulations
|    |  |   |   |   |                       # Il s'ouvre en cliquant sur le bouton "sauvegarder simulation"
|    |  |   |   |   |
|    |  |   |   |   |
|    |  |   |   |   |__sideBar              # Représente toute la barre de navigation à gauche de l'application.
|    |  |   |   |   |                       # C'est elle qui contient tous les boutons servant à lancer et manipuler une simulation.
|    |  |   |   |   |
|    |  |   |   |   |
|    |  |   |   |   |__|__entity-infos      # Représente le menu en bas et à droite de l'application.
|    |  |   |   |   |                       # Il permet essentiellement d'afficher les informations d'une entité lorsque sélectionné.
|    |  |   |   |   |
|    |  |   |   |   |
|    |  |   |   |   |__simulation-modal     # Menu qui permet de charger une simulation en temps réel
|    |  |   |   |   |                       # Demande les paramètres de la simulation
|    |  |   |   |   |
|    |  |   |   |   |
|    |  |   |   |   |__Stats-modal          # menu qui contient toutes les statistiques de la simulation en cours.
|    |  |   |   |   |                       # Il s'ouvre en cliquant sur le bouton "statistiques"
|    |  |   |   |   |
|    |  |   |   |   |
|    |  |   |   |   |__Stops-file-modal     # deprecated
|    |  |   |   |   |
|    |  |   |   |   |
|    |  |   |   |__services
|    |  |   |   |   |__cesium
|    |  |   |   |   |   |__boarding-handler.service.ts          # S'occupe de transférer les passagers entre les entités.
|    |  |   |   |   |   |__camera-handler.service.ts            # Gère les évènements lors des déplacement de la caméra (principalement le zoom)
|    |  |   |   |   |   |__entity-label-handler.service.ts      # Transmet les informations d'une entité lors d'un click
|    |  |   |   |   |   |__entity-path-handler.service.ts       # Affiche les trajet des véhicules
|    |  |   |   |   |   |__stop-position-handler.service.ts     # Gère la positions des stops
|    |  |   |   |   |   |__timeline-handler.service.ts          # Bloque la ligne du temps pour ne pas dépasser le temps courant ou final
|    |  |   |   |   |   |__vehicle-position-handler.service.ts  # Gère la positions des véhicules
|    |  |   |   |   |__communication
|    |  |   |   |   |   |__communication.service.ts             # Service pour communiquer entre le serveur et contrôler le simulateur
|    |  |   |   |   |__data-initialization
|    |  |   |   |   |   |__data-reader
|    |  |   |   |   |   |   |__data-reader.service.ts           # Service pour lire les données d'un fichier
|    |  |   |   |   |   |__data-saver
|    |  |   |   |   |   |   |__data-saver.service.ts            # Service pour sauvegarder une simulation
|    |  |   |   |   |   |__simulation-parser
|    |  |   |   |   |   |   |__simulation-parser.service.ts     # Service pour transformer les données en évènements utilisables par le client
|    |  |   |   |   |__entity-data-handler
|    |  |   |   |   |   |__entity-data-handler.ts               # Utilise les évènements pour afficher une simulation
|    |  |   |   |   |__messaging
|    |  |   |   |   |   |__message-queue-stomp.service.ts       # Queue d'évènement entre le serveur et le client
|    |  |   |   |   |__util
|    |  |   |   |   |   |__date-parser.service.ts               # Intèprète des valeurs de dates
|    |  |   |   |   |   |__menu-notifier.service.ts             # Envoi une notification à un menu pour lui dire de faire une action
|    |  |   |   |   |   |__polyline-decoder.service.ts          # Intèrpréte une polyline encodée en chemin utilisable par l'application
|    |  |   |   |   |   |__stop-lookup.service.ts               # Outil pour associer les identifiants des stops à une position
|    |  |   |   |   |__viewer-sharing
|    |  |   |   |   |   |__viewer-sharing.service.ts            # Service pour partager le viewer de césium entre les composantes
|    |  |   |   |__app.component.ts
```
