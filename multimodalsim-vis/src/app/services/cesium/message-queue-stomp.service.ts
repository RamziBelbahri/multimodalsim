import { Stomp, CompatClient, IMessage } from '@stomp/stompjs'

const PING:string = "PING"
const PONG:string = "PONG"
// uses STOMP with active MQ
export class MessageQueueStompService {
	public socketAddress:string;
	public client:CompatClient;
	private readonly HEADERS = {id: 'JUST.FCX', ack: 'client'};
	private readonly QUEUE = "/queue/server";
	private readonly PROTOCOLS = ["v11.stomp"];

	constructor(socketAddress:string) {
		this.socketAddress = socketAddress;
		this.client = Stomp.client(socketAddress, this.PROTOCOLS);
		this.client.connect("admin","admin", this.onConnect, this.onError);

	}

	onConnect():void {
		this.client.subscribe(this.QUEUE,this.onMessage,this.HEADERS)
	}

	onMessage(msg:IMessage):void {
		if(msg.body == PING) {
			console.log("PING -- keeps the websocket open");
			this.client.send(this.QUEUE, this.HEADERS, PONG);
		}
		msg.ack();
	}

	onError(err:IMessage):void {
		alert("An error occured: " + err.body)
	}
}
