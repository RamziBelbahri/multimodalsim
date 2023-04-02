export interface EntityEvent {
	id: string;
	time: number;
	status: string;
	readonly eventType: string;
	duration:string;
	readonly isRealtime:boolean;
}
