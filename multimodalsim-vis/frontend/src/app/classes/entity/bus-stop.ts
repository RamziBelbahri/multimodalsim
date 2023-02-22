import { Entity } from 'cesium';

export class BusStop {
	entity:Entity;
	onboardersTotal: number;
	constructor(entity:Entity, onBoardersTotal:number) {
		this.entity = entity;
		this.onboardersTotal = onBoardersTotal;
	}
}
