export class EventObservation {
	index: number;
	name: string;
	priority: number;
	time: string;
	constructor(index: number,
		name: string,
		priority: number,
		time: string
	) {
		this.index = index;
		this.name = name;
		this.priority = priority;
		this.time = time;
	}
}
