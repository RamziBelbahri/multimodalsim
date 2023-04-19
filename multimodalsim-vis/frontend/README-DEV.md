 Documentation pour les developpeurs du client:

 Components et services

```shell

|__multimodalsim-vis
|    |__frontend
|    |  |__src
|    |  |   |__app
|    |  |   |   |__components 
|    |  |   |   |   |__debug-receiver       #Correspond à la fenêtre qui s'ouvre lorsqu'on clique sur le bouton 
|    |  |   |   |   |                       #l'application. Cette fenêtre affiche les logs issus de la simulation temps réel
|    |  |   |   |   |                 
|    |  |   |   |   |                 
|    |  |   |   |   |__launch-modal         #Modale ouverte en cliquant sur le bouton "charger simulation"
|    |  |   |   |   |                       #contient tous les boutons nécessaires pour lancer charger un zip de son
|    |  |   |   |   |                       #ordinateur et lancer une simulation à partir de ce dernier.
|    |  |   |   |   |                
|    |  |   |   |   |                 
|    |  |   |   |   |__map
|    |  |   |   |   |   |__cesium-container
|    |  |   |   |   |__save-modal           #Modale pour la sauvegarde des simulations
|    |  |   |   |   |                       #Elle s'ouvre en cliquant sur le bouton "sauvegarder simulation" 
|    |  |   |   |   |                 
|    |  |   |   |   |  
|    |  |   |   |   |__sideBar              #Représente toute la barre de navigation à gauche de l'application. 
|    |  |   |   |   |                       #C'est elle qui contient tous les boutons servant à lancer et manipuler une simulation.
|    |  |   |   |   |                 
|    |  |   |   |   |  
|    |  |   |   |   |   |__entity-infos     #Représente toute la petite barre de navigation en bas et à droite de l'application.
|    |  |   |   |   |                       #Elle permet essentiellement d'afficher à temps les informations des entités.
|    |  |   |   |   |                 
|    |  |   |   |   |  
|    |  |   |   |   |__simulation-modal     #
|    |  |   |   |   |                 
|    |  |   |   |   |  
|    |  |   |   |   |__Stats-modal          #Modale qui contient toutes les statistiques de la simulation en cours.
|    |  |   |   |   |                       #Elle s'ouvre en cliquant sur le bouton "statistiques"
|    |  |   |   |   |                 
|    |  |   |   |   |  
|    |  |   |   |   |__Stops-file-modal
|    |  |   |   |   |                 
|    |  |   |   |   |  
|    |  |   |   |__services
|    |  |   |   |   |__cesium
|    |  |   |   |   |   |__boarding-handler.service.ts
|    |  |   |   |   |   |__camera-handler.service.ts
|    |  |   |   |   |   |__entity-label-handler.service.ts
|    |  |   |   |   |   |__entity-path-handler.service.ts
|    |  |   |   |   |   |__stop-position-handler.service.ts
|    |  |   |   |   |   |__timeline-handler.service.ts
|    |  |   |   |   |   |__vehicle-position-handler.service.ts
|    |  |   |   |   |__communication
|    |  |   |   |   |   |__communication.service.ts
|    |  |   |   |   |__data-initialization
|    |  |   |   |   |   |__data-reader
|    |  |   |   |   |   |   |__data-reader.service.ts
|    |  |   |   |   |   |__data-saver
|    |  |   |   |   |   |   |__data-saver.service.ts
|    |  |   |   |   |   |__simulation-parser
|    |  |   |   |   |   |   |__simulation-parser.service.ts
|    |  |   |   |   |__entity-data-handler
|    |  |   |   |   |   |__entity-data-handler.ts
|    |  |   |   |   |__messaging
|    |  |   |   |   |   |__message-queue-stomp.service.ts
|    |  |   |   |   |__util
|    |  |   |   |   |   |__date-parser.service.ts
|    |  |   |   |   |   |__menu-notifier.service.ts
|    |  |   |   |   |   |__polyline-decoder.service.ts
|    |  |   |   |   |   |__stop-lookup.service.ts
|    |  |   |   |   |   |__message-queue-stomp.service.ts
|    |  |   |   |   |__viewer-sharing
|    |  |   |   |   |   |__viewer-sharing.service.ts
|    |  |   |   |__app.component.ts
```