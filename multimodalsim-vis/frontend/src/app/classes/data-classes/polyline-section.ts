import { Cartesian3 } from 'cesium';

export class PolylineSection {
	positions: Array<Cartesian3>;
	times: Array<Array<number>>;

	constructor() {
		this.positions = new Array<Cartesian3>();
		this.times = new Array<Array<number>>();
	}
}
