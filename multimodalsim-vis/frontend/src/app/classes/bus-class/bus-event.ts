import { EntityEvent } from '../entity/entity-event';

export class BusEvent implements EntityEvent {
	id: number;
	time: string;
	status: string;
	previous_stop: string[];
	current_stop: string;
	next_stop: string[];
	assigned_legs: number[];
	onboard_legs: number[];
	alighted_legs: number[];
	cumulative_distance: number;
	longitude: number;
	latitude: number;
	duration: string;

	constructor(
		id: number,
		time: string,
		status: string,
		previous_stop: string[],
		current_stop: string,
		next_stop: string[],
		assigned_legs: number[],
		onboard_legs: number[],
		alighted_legs: number[],
		cumulative_distance: number,
		longitude: number,
		latitude: number,
		duration: string
	) {
		this.id = id;
		this.time = time;
		this.status = status;
		this.previous_stop = previous_stop;
		this.current_stop = current_stop;
		this.next_stop = next_stop;
		this.assigned_legs = assigned_legs;
		this.onboard_legs = onboard_legs;
		this.alighted_legs = alighted_legs;
		this.cumulative_distance = cumulative_distance;
		this.longitude = longitude;
		this.latitude = latitude;
		this.duration = duration;
	}
}
