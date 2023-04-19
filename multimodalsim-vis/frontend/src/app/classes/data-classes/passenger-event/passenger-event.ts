import { EventType } from 'src/app/services/util/event-types';
import { EntityEvent } from '../entity/entity-event';

export class PassengerEvent implements EntityEvent {
	id: string;
	time: number;
	status: string;
	assigned_vehicle: number | undefined;
	current_location: number[] | number;
	previous_legs: number[][];
	current_leg: number[][];
	next_legs: number[][];
	duration: string;
	readonly eventType: string = EventType.PASSENGER;
	readonly isRealtime: boolean;

	constructor(
		id: string,
		time: number,
		status: string,
		assigned_vehicle: number | undefined,
		current_location: number[],
		previous_legs: number[][],
		current_leg: number[][],
		next_legs: number[][],
		duration: string,
		isRealtime = false
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
		this.isRealtime = isRealtime;
	}
}
