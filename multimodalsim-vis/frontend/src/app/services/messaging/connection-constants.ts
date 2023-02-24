export class ConnectionCredentials {
    public static readonly PROTOCOLS = ["v11.stomp"];
    public static readonly HEADERS = {id: 'JUST.FCX', ack: 'client'};
    public static readonly QUEUE = "/queue/server";
    public static readonly WEBSOCKET = "ws://localhost:61614/stomp";
    public static readonly USERNAME = "admin";
    public static readonly PASSWORD = "admin";
    public static readonly EVENT_QUEUE = '/queue/event';
}