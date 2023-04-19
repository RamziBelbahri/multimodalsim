 Documentation pour les developpeurs du client:

 Components et services

```bash
|_multimodalsim-vis
|    |_frontend
|    |  |_src
|    |  |   |_app
|    |  |   |   |_components 
|    |  |   |   |   |_debug-receiver  #Correspond à la fenêtre qui s'ouvre lorsqu'on clique sur le bouton 
|    |  |   |   |   |                 #l'application. Cette fenêtre affiche les logs issus de la simulation temps réel
|    |  |   |   |   |                 
|    |  |   |   |   |                 
|    |  |   |   |   |_launch-modal    #Modale ouverte en cliquant sur le bouton "charger une simulation"
|    |  |   |   |   |                 #contient tous les boutons nécessaires pour lancer charger un zip de son
|    |  |   |   |   |                 #ordinateur et lancer une simulation à partir de ce dernier.
|    |  |   |   |   |                
|    |  |   |   |   |                 
|    |  |   |   |   |_map
|    |  |   |   |   |   |_cesium-container #
|    |  |   |   |   |_save-modal
|    |  |   |   |   |_sideBar
|    |  |   |   |   |   |_entity-infos
|    |  |   |   |   |_simulation-modal
|    |  |   |   |   |_Stats-modal
|    |  |   |   |   |_Stops-file-modal
|    |  |   |   |_services
|    |  |   |   |   |_cesium
|    |  |   |   |   |   |_boarding-handler.service.ts
|    |  |   |   |   |   |_camera-handler.service.ts
|    |  |   |   |   |   |_entity-label-handler.service.ts
|    |  |   |   |   |   |_entity-path-handler.service.ts
|    |  |   |   |   |   |_stop-position-handler.service.ts
|    |  |   |   |   |   |_timeline-handler.service.ts
|    |  |   |   |   |   |_vehicle-position-handler.service.ts
|    |  |   |   |   |_communication
|    |  |   |   |   |   |_communication.service.ts
|    |  |   |   |   |_data-initialization
|    |  |   |   |   |   |_data-reader
|    |  |   |   |   |   |   |_data-reader.service.ts
|    |  |   |   |   |   |_data-saver
|    |  |   |   |   |   |   |_data-saver.service.ts
|    |  |   |   |   |   |_simulation-parser
|    |  |   |   |   |   |   |_simulation-parser.service.ts
|    |  |   |   |   |_entity-data-handler
|    |  |   |   |   |   |_entity-data-handler.ts
|    |  |   |   |   |_messaging
|    |  |   |   |   |   |_message-queue-stomp.service.ts
|    |  |   |   |   |_util
|    |  |   |   |   |   |_date-parser.service.ts
|    |  |   |   |   |   |_menu-notifier.service.ts
|    |  |   |   |   |   |_polyline-decoder.service.ts
|    |  |   |   |   |   |_stop-lookup.service.ts
|    |  |   |   |   |   |_message-queue-stomp.service.ts
|    |  |   |   |   |_viewer-sharing
|    |  |   |   |   |   |_viewer-sharing.service.ts
|    |  |   |   |_app.component.ts
```