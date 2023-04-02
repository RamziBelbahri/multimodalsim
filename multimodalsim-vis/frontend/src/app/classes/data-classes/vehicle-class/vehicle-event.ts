import { EventType } from 'src/app/services/util/event-types';
import { EntityEvent } from '../entity/entity-event';
import { RealTimePolyline } from '../realtime-polyline';

export class VehicleEvent implements EntityEvent {
	id: string;
	time: number;
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
	polylines: string | any;
	duration: string;
	readonly eventType: string = EventType.VEHICLE;
	readonly isRealtime: boolean;

	constructor(
		id: string,
		time: number,
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
		polylines: string | any,
		duration: string,
		isRealtime:boolean = false
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
		this.polylines = polylines;
		this.duration = duration == null ? '0' : duration;
		this.isRealtime = isRealtime;
	}
}
