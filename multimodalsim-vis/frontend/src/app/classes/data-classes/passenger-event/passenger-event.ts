import { EntityEvent } from '../entity/entity-event';

export class PassengerEvent implements EntityEvent {
	id: string;
	time: string;
	status: string;
	assigned_vehicle: number | undefined;
	current_location: number[] | number;
	previous_legs: number[][];
	current_leg: number[][];
	next_legs: number[][];
	duration: string;
	readonly eventType: string = 'PASSENGER';

	constructor(
		id: string,
		time: string,
		status: string,
		assigned_vehicle: number | undefined,
		current_location: number[],
		previous_legs: number[][],
		current_leg: number[][],
		next_legs: number[][],
		duration: string
	) {
		this.id = id;
		this.time = time;
		this.status = status;
		this.assigned_vehicle = assigned_vehicle;
		this.current_location = current_location;
		this.previous_legs = previous_legs;
		this.current_leg = current_leg;
		this.next_legs = next_legs;
		this.duration = duration == null ? '0 days 00:00:00' : duration;
	}
}
