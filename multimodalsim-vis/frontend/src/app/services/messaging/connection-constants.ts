export class ConnectionCredentials {
	public static readonly PROTOCOLS                = ['v11.stomp'];
	public static readonly HEADERS                  = {id: 'JUST.FCX', ack: 'client'};
	public static readonly QUEUE                    = '/queue/server';
	public static readonly WEBSOCKET                = 'ws://localhost:61614/stomp';
	public static readonly USERNAME                 = 'admin';
	public static readonly PASSWORD                 = 'admin';
	public static readonly EVENT_QUEUE              = '/queue/event';
	public static readonly INFO_QUEUE               = '/queue/info';
	public static readonly TRIPS_QUEUE              = '/queue/trips';
	public static readonly VEHICLE_QUEUE            = '/queue/vehicles';
	public static readonly EVENTS_OBSERVATION_QUEUE = '/queue/events_observation';
}