# Documentation pour les developpeurs du client

## Components et services

```shell
|__multimodalsim-vis
|    |_frontend
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
|    |  |   |   |   |__|__entity-infos     #Représente toute la petite barre de navigation en bas et à droite de l'application.
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
|    |  |   |   |__services
|    |  |   |   |   |__cesium
|    |  |   |   |   |   |__boarding-handler.service.ts #Service qui s'occupe de gérer les embarquements des passagers
|    |  |   |   |   |   |                              # il gère toujours les embarquements, qu'on avance ou qu'on recule dans le temps
|    |  |   |   |   |   |              
|    |  |   |   |   |   |                          
|    |  |   |   |   |   |__camera-handler.service.ts   #Service utilisé pour la mise à jour de la visualisation en fonction des 
|    |  |   |   |   |   |                              #différents niveaux de zoom
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |   |__entity-label-handler.service.ts
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |   |__entity-path-handler.service.ts   #Service utilisé pour l'affichage des polylines
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |   |__stop-position-handler.service.ts #Service utilisé pour la création des icones des stops et passagers et 
|    |  |   |   |   |   |                                   #pour la mise à jour de  leurs images
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |   |__timeline-handler.service.ts
|    |  |   |   |   |   |              
|    |  |   |   |   |   |      
|    |  |   |   |   |   |__vehicle-position-handler.service.ts  #Service utilisé pour la création des icones des véhicules et pour la 
|    |  |   |   |   |   |                                   #mise à jour de  leurs images
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |__communication
|    |  |   |   |   |   |__communication.service.ts     #Service utilisé pour toutes les communications avec le serveur
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |__data-initialization              #Tous les services utilisés pour manipuler les fichiers d'une simulation
|    |  |   |   |   |   |__data-reader
|    |  |   |   |   |   |   |__data-reader.service.ts   #Service qui fournit toutes fonctions pour la lecture des fichiers 
|    |  |   |   |   |   |                               #d'une simulation
|    |  |   |   |   |   |__data-saver
|    |  |   |   |   |   |   |__data-saver.service.ts    #Service qui fournit toutes fonctions pour l'enregistrement des fichiers d'une 
|    |  |   |   |   |   |                               #simulation
|    |  |   |   |   |   |__simulation-parser
|    |  |   |   |   |   |   |__simulation-parser.service.ts 
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |__entity-data-handler
|    |  |   |   |   |   |__entity-data-handler.ts       #Service qui fournit toutes fonction pour manipuler les icones des entités
|    |  |   |   |   |__messaging
|    |  |   |   |   |   |__message-queue-stomp.service.ts
|    |  |   |   |   |__util
|    |  |   |   |   |   |__date-parser.service.ts
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |   |__menu-notifier.service.ts
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |   |__polyline-decoder.service.ts  #Service utilisé pour décoder les polylines
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |   |__stop-lookup.service.ts       #Service utilisé pour fournir les infos des icones de stops 
|    |  |   |   |   |   |                               #(ajout de mapping id-coordonnées, taille de l'icone)
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |   |__message-queue-stomp.service.ts
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |   |__viewer-sharing
|    |  |   |   |   |   |__viewer-sharing.service.ts    #Service qui permet de partager "viewer" cesium entre tous les components
|    |  |   |   |   |   |              
|    |  |   |   |   |   |
|    |  |   |   |__app.component.ts         #Component de base de toute l'application
```