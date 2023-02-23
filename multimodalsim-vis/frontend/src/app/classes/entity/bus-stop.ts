import { Entity } from 'cesium';

export class BusStop {
	private entity:Entity;
	private onboardersTotal: number;

	constructor(entity:Entity, onBoardersTotal:number) {
		this.entity = entity;
		this.onboardersTotal = onBoardersTotal;
	}
}
