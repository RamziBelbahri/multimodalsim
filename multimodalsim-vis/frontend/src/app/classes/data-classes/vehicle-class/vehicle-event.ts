import { EntityEvent } from '../entity/entity-event';

export class VehicleEvent implements EntityEvent {
	id: string;
	time: string;
	status: string;
	previous_stops: string[];
	current_stop: string;
	next_stops: string[];
	assigned_legs: number[];
	onboard_legs: number[];
	alighted_legs: number[];
	cumulative_distance: number;
	longitude: number;
	latitude: number;
	duration: string;
	readonly eventType: string = 'VEHICLE';

	constructor(
		id: string,
		time: string,
		status: string,
		previous_stops: string[],
		current_stop: string,
		next_stops: string[],
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
		this.previous_stops = previous_stops;
		this.current_stop = current_stop;
		this.next_stops = next_stops;
		this.assigned_legs = assigned_legs;
		this.onboard_legs = onboard_legs;
		this.alighted_legs = alighted_legs;
		this.cumulative_distance = cumulative_distance;
		this.longitude = longitude;
		this.latitude = latitude;
		this.duration = duration == null ? '0 days 00:00:00' : duration;
	}
}
