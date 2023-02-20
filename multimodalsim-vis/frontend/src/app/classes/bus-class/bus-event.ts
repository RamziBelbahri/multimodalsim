import { Cartesian3 } from 'cesium';
import { CesiumClass } from 'src/app/shared/cesium-class';
import { EntityEvent } from '../entity/entity-event';

export class BusEvent implements EntityEvent {
	id: string;
	time: string;
	status: string;
	previous_stop: string[];
	current_stop: string;
	next_stop: string[];
	assigned_legs: number[];
	onboard_legs: number[];
	alighted_legs: number[];
	cumulative_distance: number;
	position: Cartesian3 | null;
	duration: string;
	hasChanged: boolean;
	movement: Cartesian3;
	readonly eventType: string = 'BUS';

	constructor(
		id: string,
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
		// Certains events(trajets en cours) ont des positions nulles, on veut conserver cette information
		this.position = longitude == null || latitude == null ? null : CesiumClass.cartesianDegrees(longitude, latitude);
		this.duration = duration;
		this.hasChanged = false;
		this.movement = CesiumClass.cartesian3(0, 0, 0);
	}
}
