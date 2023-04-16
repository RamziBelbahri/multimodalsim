import os
class ConnectionCredentials:
    INFO_QUEUE                  = '/queue/info'
    EVENT_QUEUE                 = '/queue/event'
    TRIPS_QUEUE                 = '/queue/trips'
    VEHICLE_QUEUE               = '/queue/vehicles'
    EVENTS_OBSERVATION_QUEUE    = '/queue/events_observation'
    USERNAME                    = 'admin'
    PASSWORD                    = 'admin'
    LOCALHOST                   = 'localhost'
    try:
        HOST                    = os.environ['ACTIVEMQ']
    except:
        HOST                    = 'localhost'
    PORT                        = 61613
    ENTITY_EVENTS_QUEUE 		= '/queue/entity_events'
    SIMULATION_COMPLETED		= 'SIMULATION_COMPLETED'
    HEADERS                     = {'id': 'JUST.FCX', 'ack': 'client'}
