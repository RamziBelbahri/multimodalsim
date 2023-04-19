# Documentation pour les developpeurs du client:

# Components et services
```
|_multimodalsim-vis
|    |_frontend
|    |  |_src
|    |  |   |_app
|    |  |   |   |_##components 
|    |  |   |   |   |_###debug-receiver  <span style="color:green"> correspond à la fenêtre qui s'ouvre lorsqu'on clique sur le bouton 
|    |  |   |   |   |                       de l'application.
|    |  |   |   |   |                       cette fenêtre affiche les logs issus de la simulation temps réel</span>
|    |  |   |   |   |_###launch-modal
|    |  |   |   |   |_###map
|    |  |   |   |   |   |_###cesium-container
|    |  |   |   |   |_###save-modal
|    |  |   |   |   |_###sideBar
|    |  |   |   |   |   |_###entity-infos
|    |  |   |   |   |_###simulation-modal
|    |  |   |   |   |_###Stats-modal
|    |  |   |   |   |_###Stops-file-modal
|    |  |   |   |_##services
|    |  |   |   |   |_###cesium
|    |  |   |   |   |   |_###boarding-handler.service.ts
|    |  |   |   |   |   |_###camera-handler.service.ts
|    |  |   |   |   |   |_###entity-label-handler.service.ts
|    |  |   |   |   |   |_###entity-path-handler.service.ts
|    |  |   |   |   |   |_###stop-position-handler.service.ts
|    |  |   |   |   |   |_###timeline-handler.service.ts
|    |  |   |   |   |   |_###vehicle-position-handler.service.ts
|    |  |   |   |   |_###communication
|    |  |   |   |   |   |_###communication.service.ts
|    |  |   |   |   |_###data-initialization
|    |  |   |   |   |   |_###data-reader
|    |  |   |   |   |   |   |_###data-reader.service.ts
|    |  |   |   |   |   |_###data-saver
|    |  |   |   |   |   |   |_###data-saver.service.ts
|    |  |   |   |   |   |_###simulation-parser
|    |  |   |   |   |   |   |_###simulation-parser.service.ts
|    |  |   |   |   |_###entity-data-handler
|    |  |   |   |   |   |_###entity-data-handler.ts
|    |  |   |   |   |_###messaging
|    |  |   |   |   |   |_###message-queue-stomp.service.ts
|    |  |   |   |   |_###util
|    |  |   |   |   |   |_###date-parser.service.ts
|    |  |   |   |   |   |_###menu-notifier.service.ts
|    |  |   |   |   |   |_###polyline-decoder.service.ts
|    |  |   |   |   |   |_###stop-lookup.service.ts
|    |  |   |   |   |   |_###message-queue-stomp.service.ts
|    |  |   |   |   |_###viewer-sharing
|    |  |   |   |   |   |_###viewer-sharing.service.ts
|    |  |   |   |_##app.component.ts
```