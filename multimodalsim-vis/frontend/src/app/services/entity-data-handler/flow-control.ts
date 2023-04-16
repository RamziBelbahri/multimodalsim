export class FlowControl {
	static readonly TIME_BUFFER_MS = 100 * 1000;
	static readonly ON_NEW_EVENTS = 'newevent';
	static readonly ON_PAUSE = 'onpause';
	static readonly FRONTEND_EVENT = 'frontendevent'; // this is appended to an event created in the frontend
}