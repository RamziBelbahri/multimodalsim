import { Entity } from 'cesium';

export class BusStop {
	entity:Entity;
	numberOfPassengers:number;
	constructor(entity:Entity, numberoOfPassengers:number) {
		this.entity = entity;
		this.numberOfPassengers = numberoOfPassengers;
	}
}