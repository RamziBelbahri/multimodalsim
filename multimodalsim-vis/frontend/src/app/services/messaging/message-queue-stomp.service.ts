import { Stomp, CompatClient, IMessage } from '@stomp/stompjs'

const PING:string = "PING"
const PONG:string = "PONG"
// uses STOMP with active MQ
export class MessageQueueStompService {
	public socketAddress:string;
	private readonly PROTOCOLS = ["v11.stomp"];

	public static client:CompatClient;
	private static readonly HEADERS = {id: 'JUST.FCX', ack: 'client'};
	private static readonly QUEUE = "/queue/server";
	private static readonly WEBSOCKET = "ws://localhost:61614/stomp";
	// note: static is needed so that there the callbacks can work
	constructor(socketAddress:string=MessageQueueStompService.WEBSOCKET, debug:boolean=false, username:string="admin", password:string="admin") {
		this.socketAddress = socketAddress;
		MessageQueueStompService.client = Stomp.client(socketAddress, this.PROTOCOLS);
		if(!debug){
			MessageQueueStompService.client.debug = function() {};
		}
		MessageQueueStompService.client.connect(username,password, this.onConnect, this.onError);
	}

	onConnect():void {
		MessageQueueStompService.client.subscribe(MessageQueueStompService.QUEUE,MessageQueueStompService.onMessage)
	}

	static onMessage(msg:IMessage):void {
		if(msg.body == PING) {
			console.log("PING -- keeps the websocket open");
			MessageQueueStompService.client.send(MessageQueueStompService.QUEUE, MessageQueueStompService.HEADERS, PONG);
		}
		console.log(msg.body)
		// msg.ack();
	}

	onError(err:IMessage):void {
		console.log(err.body)
	}
}
