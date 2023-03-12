import { JulianDate } from 'cesium';

export class BoardingEvent {
	passengerId: string;
	originId: string;
	targetId: string;
	isBoardingVehicle: boolean;
	time: JulianDate;

	// Si l'origine ou le target n'existe pas, utiliser une string vide. Devrait rarement être le cas par contre.
	constructor(self: string, origin: string, target: string, isBoardingVehicle: boolean, time: JulianDate) {
		this.passengerId = self;
		this.originId = origin;
		this.targetId = target;
		this.isBoardingVehicle = isBoardingVehicle;
		this.time = time;
	}
}
